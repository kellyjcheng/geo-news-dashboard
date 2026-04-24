import asyncio
import json
import os
import time
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
UCDP_API_KEY = os.getenv("UCDP_API_KEY")

NEWS_QUERY = (
    "(geopolitics OR conflict OR diplomacy OR sanctions OR cyberattack OR election OR"
    " military OR intelligence)"
)

app = FastAPI(title="Geo-News Command Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Estimated annual battle deaths (2023–2024 figures). Consistent methodology:
# direct conflict deaths only, not indirect (disease/famine). Source: ACLED, UCDP, UN reports.
CONFLICTS_DATA = [
    {"id": "russia-ukraine", "name": "Russia–Ukraine War", "country": "Ukraine", "region": "Europe", "parties": ["Russia", "Ukraine"], "start_year": 2022, "casualties_estimate": 80000, "lat": 49.0, "lng": 31.0, "description": "Estimated annual battle deaths 2023 (direct KIA). Total since 2022 exceeds 200,000.", "status": "Active"},
    {"id": "myanmar-civil-war", "name": "Myanmar Civil War", "country": "Myanmar", "region": "Asia-Pacific", "parties": ["Military Junta (SAC)", "PDF", "EROs"], "start_year": 2021, "casualties_estimate": 45000, "lat": 19.7, "lng": 96.0, "description": "Estimated deaths 2023–2024 across all fronts. Junta losing territory to resistance.", "status": "Active"},
    {"id": "gaza-war", "name": "Gaza War", "country": "Palestine", "region": "Middle East", "parties": ["Israel", "Hamas", "PIJ"], "start_year": 2023, "casualties_estimate": 52000, "lat": 31.5, "lng": 34.4, "description": "Confirmed deaths Oct 2023–Apr 2025 per Gaza Health Ministry (includes civilians).", "status": "Active"},
    {"id": "sudan-civil-war", "name": "Sudan Civil War", "country": "Sudan", "region": "Africa", "parties": ["SAF", "RSF"], "start_year": 2023, "casualties_estimate": 20000, "lat": 15.5, "lng": 32.5, "description": "Estimated direct conflict deaths 2023–2024. Indirect mortality (famine/disease) far higher.", "status": "Active"},
    {"id": "ethiopia-conflict", "name": "Ethiopia – Amhara & Oromia", "country": "Ethiopia", "region": "Africa", "parties": ["Ethiopian Gov.", "FANO", "OLA"], "start_year": 2022, "casualties_estimate": 10000, "lat": 10.5, "lng": 37.5, "description": "Estimated annual deaths in ongoing Amhara and Oromia conflicts post-Tigray War.", "status": "Active"},
    {"id": "mali-sahel", "name": "Sahel Insurgency", "country": "Mali / Burkina Faso / Niger", "region": "Africa", "parties": ["Sahel Juntas", "Africa Corps", "JNIM", "ISGS"], "start_year": 2012, "casualties_estimate": 8500, "lat": 14.5, "lng": -2.5, "description": "Combined annual deaths across Mali, Burkina Faso, and Niger (2023, ACLED).", "status": "Active"},
    {"id": "drc-conflict", "name": "DRC – Eastern Conflict", "country": "DR Congo", "region": "Africa", "parties": ["DRC Gov.", "M23 / RDF", "FDLR", "Local Militias"], "start_year": 1996, "casualties_estimate": 7500, "lat": -1.7, "lng": 28.9, "description": "Estimated annual deaths in eastern DRC 2023. M23 seized Goma in early 2025.", "status": "Active"},
    {"id": "nigeria-conflict", "name": "Nigeria – Northeast & Northwest", "country": "Nigeria", "region": "Africa", "parties": ["Nigerian Military", "Boko Haram", "ISWAP", "Bandits"], "start_year": 2009, "casualties_estimate": 7000, "lat": 10.5, "lng": 7.4, "description": "Combined annual deaths from Islamist insurgency (NE) and banditry (NW) in 2023.", "status": "Active"},
    {"id": "burkina-faso", "name": "Burkina Faso Insurgency", "country": "Burkina Faso", "region": "Africa", "parties": ["Burkina Gov.", "VDP", "JNIM", "ISGS"], "start_year": 2015, "casualties_estimate": 6500, "lat": 12.4, "lng": -1.6, "description": "Estimated annual deaths 2023. Junta has lost control of ~40% of territory.", "status": "Active"},
    {"id": "yemen-civil-war", "name": "Yemen – Houthi Conflict", "country": "Yemen", "region": "Middle East", "parties": ["Houthis", "Saudi Coalition", "Yemeni Gov."], "start_year": 2015, "casualties_estimate": 3500, "lat": 15.5, "lng": 48.5, "description": "Estimated annual battle deaths 2023. Conflict lower intensity; Houthis attacking Red Sea shipping.", "status": "Active"},
    {"id": "somalia-conflict", "name": "Somalia – Al-Shabaab", "country": "Somalia", "region": "Africa", "parties": ["Somalia Gov.", "ATMIS", "Al-Shabaab"], "start_year": 2006, "casualties_estimate": 3500, "lat": 5.1, "lng": 46.2, "description": "Estimated annual deaths 2023 in ongoing insurgency against federal government.", "status": "Active"},
    {"id": "haiti-gang", "name": "Haiti – Gang War", "country": "Haiti", "region": "Latin America", "parties": ["Viv Ansanm", "Haitian Police", "Kenya-led MSS"], "start_year": 2021, "casualties_estimate": 5600, "lat": 18.9, "lng": -72.3, "description": "Confirmed conflict deaths 2023–2024 (UN). Gangs control ~85% of Port-au-Prince.", "status": "Active"},
    {"id": "israel-lebanon", "name": "Israel–Lebanon 2024", "country": "Lebanon", "region": "Middle East", "parties": ["Israel IDF", "Hezbollah"], "start_year": 2023, "casualties_estimate": 4000, "lat": 33.9, "lng": 35.5, "description": "Confirmed deaths in 2024 escalation. Ceasefire since Nov 2024; IDF remains in south Lebanon.", "status": "Ceasefire"},
    {"id": "afghanistan", "name": "Afghanistan – ISKP Insurgency", "country": "Afghanistan", "region": "Asia-Pacific", "parties": ["Taliban", "ISKP"], "start_year": 2021, "casualties_estimate": 2800, "lat": 33.9, "lng": 67.7, "description": "Estimated annual deaths from ISKP attacks and Taliban operations in 2023.", "status": "Active"},
    {"id": "west-bank", "name": "West Bank – IDF Operations", "country": "Palestine", "region": "Middle East", "parties": ["Israel IDF", "Palestinian Militias"], "start_year": 2022, "casualties_estimate": 700, "lat": 31.9, "lng": 35.2, "description": "Confirmed Palestinian deaths in West Bank operations 2023 (UN OCHA).", "status": "Active"},
    {"id": "mozambique", "name": "Mozambique – Cabo Delgado", "country": "Mozambique", "region": "Africa", "parties": ["Mozambique Gov.", "SADC Force", "ISCAP"], "start_year": 2017, "casualties_estimate": 1200, "lat": -13.3, "lng": 40.7, "description": "Estimated annual deaths 2023. ISCAP insurgency in northern Cabo Delgado province.", "status": "Active"},
    {"id": "cameroon-anglophone", "name": "Cameroon – Anglophone Crisis", "country": "Cameroon", "region": "Africa", "parties": ["Cameroon Gov.", "Ambazonian Separatists"], "start_year": 2017, "casualties_estimate": 1000, "lat": 5.9, "lng": 10.2, "description": "Estimated annual deaths 2023 in low-intensity separatist conflict in NW/SW regions.", "status": "Active"},
    {"id": "syria-residual", "name": "Syria – Residual Violence", "country": "Syria", "region": "Middle East", "parties": ["HTS Gov.", "SDF", "ISIS remnants", "Pro-Turkey factions"], "start_year": 2011, "casualties_estimate": 2500, "lat": 35.0, "lng": 38.5, "description": "Estimated annual deaths 2024 post-Assad collapse. ISIS resurgent in Deir ez-Zor.", "status": "Active"},
]


class ConflictItem(BaseModel):
    id: str
    name: str
    country: str
    region: str
    parties: list[str]
    start_year: int
    casualties_estimate: int
    lat: float
    lng: float
    description: str
    status: str


class ConflictsResponse(BaseModel):
    conflicts: list[ConflictItem]


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


UCDP_BASE = "https://ucdpapi.pcr.uu.se/api"
UCDP_CACHE_TTL = 3600
_ucdp_cache: dict[str, Any] = {"data": None, "ts": 0.0}

COUNTRY_COORDS: dict[str, tuple[float, float]] = {
    "ukraine": (49.0, 31.0),
    "russia": (61.5, 105.3),
    "sudan": (15.5, 32.5),
    "yemen": (15.5, 48.5),
    "ethiopia": (9.1, 40.5),
    "syria": (34.8, 38.9),
    "gaza": (31.5, 34.4),
    "palestine": (31.9, 35.2),
    "myanmar": (19.7, 96.0),
    "congo": (-1.7, 28.9),
    "nigeria": (10.5, 7.4),
    "mali": (17.6, -3.9),
    "burkina": (12.4, -1.6),
    "somalia": (5.1, 46.2),
    "afghanistan": (33.9, 67.7),
    "haiti": (18.9, -72.3),
    "lebanon": (33.9, 35.5),
    "mozambique": (-13.3, 40.7),
    "cameroon": (5.9, 10.2),
    "niger": (17.6, 8.0),
    "libya": (26.3, 17.2),
    "south sudan": (6.9, 31.3),
    "central african": (6.6, 20.9),
    "chad": (15.4, 18.7),
    "iraq": (33.2, 43.7),
    "pakistan": (30.4, 69.3),
    "india": (20.6, 78.9),
    "philippines": (12.9, 121.8),
    "colombia": (4.6, -74.1),
    "mexico": (23.6, -102.5),
    "israel": (31.0, 34.9),
    "turkey": (38.9, 35.2),
    "iran": (32.4, 53.7),
    "eritrea": (15.2, 39.8),
    "kenya": (-0.0, 37.9),
    "mozambique": (-13.3, 40.7),
    "zimbabwe": (-19.0, 29.2),
}


def _coords_for(text: str) -> tuple[float, float]:
    lowered = text.lower()
    for key, coords in COUNTRY_COORDS.items():
        if key in lowered:
            return coords
    return (0.0, 0.0)


async def _fetch_ucdp_year(year: int) -> tuple[list, list, list]:
    if not UCDP_API_KEY:
        return [], [], []
    headers = {"x-ucdp-access-token": UCDP_API_KEY}
    version = "24.1"
    async with httpx.AsyncClient(timeout=25.0, headers=headers) as client:
        bd_r, ge_r, cf_r = await asyncio.gather(
            client.get(f"{UCDP_BASE}/BattleDeaths/{version}", params={"pagesize": "500", "Year": str(year)}),
            client.get(f"{UCDP_BASE}/GEDEvents/{version}", params={"pagesize": "2000", "Year": str(year)}),
            client.get(f"{UCDP_BASE}/UcdpPrioConflict/{version}", params={"pagesize": "500"}),
        )
    bd = bd_r.json().get("Result", []) if bd_r.status_code == 200 else []
    ge = ge_r.json().get("Result", []) if ge_r.status_code == 200 else []
    cf = cf_r.json().get("Result", []) if cf_r.status_code == 200 else []
    return bd, ge, cf


def _build_conflicts(bd: list, ge: list, cf: list, year: int) -> list[dict]:
    # Average coordinates per conflict from geo-events
    coord_map: dict[str, dict] = {}
    for ev in ge:
        cid = str(ev.get("conflict_id") or "")
        try:
            lat, lng = float(ev["latitude"]), float(ev["longitude"])
        except (KeyError, TypeError, ValueError):
            continue
        if cid not in coord_map:
            coord_map[cid] = {"lat": 0.0, "lng": 0.0, "n": 0, "country": ev.get("country", "")}
        coord_map[cid]["lat"] += lat
        coord_map[cid]["lng"] += lng
        coord_map[cid]["n"] += 1
        if ev.get("country"):
            coord_map[cid]["country"] = ev["country"]

    # Start years from conflict catalog
    start_map: dict[str, int] = {}
    for c in cf:
        cid = str(c.get("conflict_id") or "")
        try:
            start_map[cid] = int(c["year_start"])
        except (KeyError, TypeError, ValueError):
            pass

    result = []
    for item in bd:
        cid = str(item.get("conflict_id") or "")
        name = (item.get("conflict_name") or "Unknown").strip()

        try:
            deaths = int(float(item.get("bd_best") or 0))
        except (TypeError, ValueError):
            deaths = 0
        if deaths == 0:
            continue

        # Parties from "Side A - Side B" format
        parts = name.split(" - ", 1)
        parties = [p.strip() for p in parts] if len(parts) == 2 else [name]

        # Coordinates: averaged events → country fallback
        lat, lng, country = 0.0, 0.0, ""
        if cid in coord_map and coord_map[cid]["n"] > 0:
            cm = coord_map[cid]
            lat = cm["lat"] / cm["n"]
            lng = cm["lng"] / cm["n"]
            country = cm["country"]
        if lat == 0.0 and lng == 0.0:
            lat, lng = _coords_for(f"{name} {country}")

        result.append({
            "id": f"ucdp-{cid}",
            "name": name,
            "country": country or next((k.title() for k in COUNTRY_COORDS if k in name.lower()), "Unknown"),
            "region": infer_region(f"{name} {country}"),
            "parties": parties,
            "start_year": start_map.get(cid, year),
            "casualties_estimate": deaths,
            "lat": round(lat, 4),
            "lng": round(lng, 4),
            "description": f"Battle deaths {year} (UCDP best estimate): {deaths:,}.",
            "status": "Active",
        })

    return sorted(result, key=lambda x: x["casualties_estimate"], reverse=True)


async def _load_ucdp_conflicts() -> list[dict]:
    for year in [2024, 2023, 2022]:
        try:
            bd, ge, cf = await _fetch_ucdp_year(year)
            if bd:
                return _build_conflicts(bd, ge, cf, year)
        except Exception:
            continue
    return []


@app.get("/conflicts", response_model=ConflictsResponse)
async def get_conflicts() -> JSONResponse:
    now = time.time()
    if _ucdp_cache["data"] and now - _ucdp_cache["ts"] < UCDP_CACHE_TTL:
        return JSONResponse(content=_ucdp_cache["data"])

    conflicts = await _load_ucdp_conflicts()
    if not conflicts:
        conflicts = sorted(CONFLICTS_DATA, key=lambda c: c["casualties_estimate"], reverse=True)

    payload = ConflictsResponse(conflicts=conflicts).model_dump()
    _ucdp_cache["data"] = payload
    _ucdp_cache["ts"] = now
    return JSONResponse(content=payload)


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

    for attempt in range(3):
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                endpoint,
                params={"key": GEMINI_API_KEY},
                json=request_body,
            )
        if response.status_code == 429 and attempt < 2:
            await asyncio.sleep(2 ** attempt)
            continue
        break

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
