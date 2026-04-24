const API_BASE_URL = "http://127.0.0.1:8000";

export async function fetchConflicts() {
  try {
    const response = await fetch(`${API_BASE_URL}/conflicts`);
    return readJsonResponse(response);
  } catch (error) {
    console.log("Fetch Error:", error);
    throw error;
  }
}

async function readJsonResponse(response) {
  const payload = await response.json().catch(() => ({}));
  console.log("Raw Response:", payload);

  if (!response.ok) {
    throw new Error(payload.detail || "Request failed.");
  }

  return payload;
}

export async function fetchNews() {
  try {
    const response = await fetch(`${API_BASE_URL}/news`, {
      method: "GET",
    });
    return readJsonResponse(response);
  } catch (error) {
    console.log("Fetch Error:", error);
    throw error;
  }
}

export async function requestSummary(article) {
  try {
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        article: {
          ...article,
          content: article.content || article.description || "",
        },
      }),
    });

    return readJsonResponse(response);
  } catch (error) {
    console.log("Fetch Error:", error);
    throw error;
  }
}

export async function requestChatReply(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return readJsonResponse(response);
  } catch (error) {
    console.log("Fetch Error:", error);
    throw error;
  }
}
