import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

SERVER_DIR = Path(__file__).resolve().parent

load_dotenv(SERVER_DIR / ".env")

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
GEMINI_API_KEY = os.getenv("VITE_GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

NEWS_QUERY = (
    "(geopolitics OR conflict OR diplomacy OR sanctions OR cyberattack OR election OR"
    " military OR intelligence)"
)

app = FastAPI(title="Geo-News Command Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class NewsArticle(BaseModel):
    id: str
    title: str
    description: str
    content: str
    source: str
    url: str
    image_url: str | None = None
    published_at: str
    published_at_relative: str
    region: str
    topic: str


class NewsResponse(BaseModel):
    articles: list[NewsArticle]


class SummaryResponse(BaseModel):
    headline: str
    synopsis: str
    bullet_points: list[str]
    risk_level: str
    implications: list[str]
    next_steps: list[str]


class SummaryRequest(BaseModel):
    article: NewsArticle


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    article: NewsArticle
    summary: SummaryResponse
    messages: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str


@app.get("/news", response_model=NewsResponse)
async def get_news() -> JSONResponse:
    if not NEWS_API_KEY:
        raise HTTPException(status_code=500, detail="NEWS_API_KEY is not configured.")

    print(f"Using API Key: {NEWS_API_KEY[:5]}...")

    params = {
        "apiKey": NEWS_API_KEY,
        "q": NEWS_QUERY,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 20,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get("https://newsapi.org/v2/everything", params=params)
    except httpx.HTTPError as exc:
        return JSONResponse(
            status_code=502,
            content={"detail": f"News API connection failed: {str(exc)}"},
        )

    try:
        payload = response.json()
    except ValueError:
        return JSONResponse(
            status_code=502,
            content={"detail": "News API returned invalid JSON."},
        )

    if response.status_code >= 400:
        return JSONResponse(
            status_code=response.status_code,
            content={
                "detail": payload.get("message", "News API request failed."),
                "status": payload.get("status"),
                "code": payload.get("code"),
            },
        )

    if "articles" not in payload or not isinstance(payload["articles"], list):
        return JSONResponse(
            status_code=502,
            content={"detail": "News API response did not include an articles list."},
        )

    items = [normalize_article(index, article) for index, article in enumerate(payload["articles"])]
    filtered_items = [item for item in items if item.content]
    return JSONResponse(content=NewsResponse(articles=filtered_items).model_dump())


@app.post("/summarize", response_model=SummaryResponse)
async def summarize_story(request: SummaryRequest) -> JSONResponse:
    system_instruction = (
        "You are an intelligence desk analyst producing concise cyber-security style briefings. "
        "Return strict JSON with keys: headline, synopsis, bullet_points, risk_level, implications, next_steps. "
        "bullet_points, implications, and next_steps must each be arrays of 3 short strings. "
        "risk_level must be one of Low, Monitoring, Elevated, High."
    )

    user_prompt = (
        "Create a briefing for this article.\n"
        f"TITLE: {request.article.title}\n"
        f"SOURCE: {request.article.source}\n"
        f"TOPIC: {request.article.topic}\n"
        f"REGION: {request.article.region}\n"
        f"DESCRIPTION: {request.article.description}\n"
        f"CONTENT: {request.article.content}"
    )

    result = await generate_gemini_json(system_instruction, user_prompt)
    return JSONResponse(content=SummaryResponse(**result).model_dump())


@app.post("/chat", response_model=ChatResponse)
async def chat_with_summary(request: ChatRequest) -> ChatResponse:
    if not request.messages:
        raise HTTPException(status_code=400, detail="At least one message is required.")

    system_instruction = (
        "You are a geopolitical analysis assistant. Use the provided summary as the primary context. "
        "Stay focused on the selected article, answer directly, and keep replies under 220 words unless the user asks for more detail.\n\n"
        f"Article title: {request.article.title}\n"
        f"Summary headline: {request.summary.headline}\n"
        f"Synopsis: {request.summary.synopsis}\n"
        f"Key findings: {' | '.join(request.summary.bullet_points)}\n"
        f"Implications: {' | '.join(request.summary.implications)}\n"
        f"Watch items: {' | '.join(request.summary.next_steps)}"
    )

    contents = []
    for message in request.messages:
        role = "model" if message.role == "assistant" else "user"
        contents.append({"role": role, "parts": [{"text": message.content}]})

    response_text = await generate_gemini_text(system_instruction, contents)
    return ChatResponse(reply=response_text)


def normalize_article(index: int, article: dict[str, Any]) -> NewsArticle:
    published_at = article.get("publishedAt") or datetime.now(timezone.utc).isoformat()
    title = clean_text(article.get("title") or "Untitled dispatch")
    description = clean_text(article.get("description") or "No description available.")
    content = clean_text(article.get("content") or description)
    source = clean_text(article.get("source", {}).get("name") or "Unknown Source")

    return NewsArticle(
        id=f"article-{index}",
        title=title,
        description=description,
        content=content,
        source=source,
        url=article.get("url") or "",
        image_url=article.get("urlToImage"),
        published_at=published_at,
        published_at_relative=relative_time(published_at),
        region=infer_region(f"{title} {description} {content}"),
        topic=infer_topic(f"{title} {description} {content}"),
    )


def clean_text(value: str) -> str:
    return value.replace("[+", " ").strip()


def infer_region(text: str) -> str:
    lowered = text.lower()
    region_map = {
        "Europe": ["ukraine", "russia", "eu", "europe", "nato", "germany", "france"],
        "Middle East": ["israel", "gaza", "iran", "saudi", "yemen", "red sea", "syria"],
        "Asia-Pacific": ["china", "japan", "taiwan", "korea", "indonesia", "philippines"],
        "North America": ["united states", "u.s.", "canada", "mexico"],
        "Africa": ["sahel", "sudan", "niger", "mali", "burkina"],
        "Latin America": ["brazil", "argentina", "colombia", "venezuela", "peru"],
    }

    for region, keywords in region_map.items():
        if any(keyword in lowered for keyword in keywords):
            return region
    return "Global"


def infer_topic(text: str) -> str:
    lowered = text.lower()
    topic_map = {
        "CYBER": ["cyber", "hack", "breach", "malware", "ransomware", "apt"],
        "WAR": ["strike", "missile", "drone", "troops", "military", "battle", "ceasefire"],
        "DIPLOMACY": ["summit", "minister", "diplomat", "talks", "alliance"],
        "ELECTION": ["election", "vote", "poll", "candidate", "parliament"],
        "ECONOMY": ["economy", "tariff", "sanction", "market", "currency", "trade"],
    }

    for topic, keywords in topic_map.items():
        if any(keyword in lowered for keyword in keywords):
            return topic
    return "INTEL"


def relative_time(iso_timestamp: str) -> str:
    try:
        published = datetime.fromisoformat(iso_timestamp.replace("Z", "+00:00"))
    except ValueError:
        return "now"

    delta = datetime.now(timezone.utc) - published
    minutes = int(delta.total_seconds() // 60)
    if minutes < 1:
        return "now"
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    return f"{days}d ago"


async def generate_gemini_json(system_instruction: str, user_prompt: str) -> dict[str, Any]:
    payload = await generate_gemini(
        system_instruction=system_instruction,
        contents=[{"role": "user", "parts": [{"text": user_prompt}]}],
        response_mime_type="application/json",
    )

    text = extract_text(payload)
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail=f"Gemini returned invalid JSON: {text}") from exc


async def generate_gemini_text(system_instruction: str, contents: list[dict[str, Any]]) -> str:
    payload = await generate_gemini(
        system_instruction=system_instruction,
        contents=contents,
        response_mime_type="text/plain",
    )
    return extract_text(payload)


async def generate_gemini(
    *,
    system_instruction: str,
    contents: list[dict[str, Any]],
    response_mime_type: str,
) -> dict[str, Any]:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="VITE_GEMINI_API_KEY is not configured.")

    endpoint = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    )
    request_body = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": contents,
        "generationConfig": {
            "responseMimeType": response_mime_type,
            "temperature": 0.4,
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            endpoint,
            params={"key": GEMINI_API_KEY},
            json=request_body,
        )

    payload = response.json()
    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=payload.get("error", {}).get("message", "Gemini request failed."),
        )

    return payload


def extract_text(payload: dict[str, Any]) -> str:
    try:
        return payload["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="Gemini response did not contain text.") from exc
