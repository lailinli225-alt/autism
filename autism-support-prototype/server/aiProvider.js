const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = "gpt-5-mini";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";

export function setCorsHeaders(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || req.headers?.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function parseBody(req) {
  if (!req.body) {
    return {};
  }

  return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
}

export function normalizeProfile(profile = {}) {
  return {
    nickname: String(profile.nickname || "孩子").slice(0, 40),
    age: String(profile.age || "未填写").slice(0, 40),
    gender: String(profile.gender || "未填写").slice(0, 20),
    language: String(profile.language || "未填写").slice(0, 80),
    risk: String(profile.risk || "未填写").slice(0, 120),
    goal: String(profile.goal || "").trim().slice(0, 300),
  };
}

export function normalizeRecords(records = []) {
  if (!Array.isArray(records)) {
    return [];
  }

  return records.slice(0, 8).map((record) => ({
    date: String(record.date || "").slice(0, 40),
    target: String(record.target || "").slice(0, 80),
    note: String(record.note || "").slice(0, 500),
    score: Number(record.score) || null,
    trigger: String(record.trigger || "").slice(0, 200),
    intervention: String(record.intervention || "").slice(0, 300),
    reaction: String(record.reaction || "").slice(0, 300),
    next: String(record.next || "").slice(0, 300),
  }));
}

function extractOpenAIText(data) {
  if (typeof data?.output_text === "string") {
    return data.output_text;
  }

  if (!Array.isArray(data?.output)) {
    return "";
  }

  return data.output
    .flatMap((item) => item.content || [])
    .map((content) => content.text || content.output_text || "")
    .join("");
}

function parseProviderError(responseText) {
  try {
    const parsed = JSON.parse(responseText);
    return String(parsed?.error?.message || parsed?.message || "").trim();
  } catch {
    return responseText.trim();
  }
}

export function parseModelJson(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return JSON.parse(fencedMatch ? fencedMatch[1] : trimmed);
}

export function getProviderConfig() {
  const configuredProvider = String(process.env.AI_PROVIDER || "").trim().toLowerCase();
  const provider =
    configuredProvider === "deepseek" || configuredProvider === "openai"
      ? configuredProvider
      : process.env.DEEPSEEK_API_KEY && !process.env.OPENAI_API_KEY
        ? "deepseek"
        : "openai";

  if (provider === "deepseek") {
    const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
    return {
      provider,
      apiKey: process.env.DEEPSEEK_API_KEY,
      apiKeyName: "DEEPSEEK_API_KEY",
      model: process.env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL,
      modelName: "DEEPSEEK_MODEL",
      url: `${baseUrl}/chat/completions`,
    };
  }

  return {
    provider,
    apiKey: process.env.OPENAI_API_KEY,
    apiKeyName: "OPENAI_API_KEY",
    model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    modelName: "OPENAI_MODEL",
    url: OPENAI_RESPONSES_URL,
  };
}

export async function callModel(config, { instructions, messages }) {
  const isDeepSeek = config.provider === "deepseek";
  const body = isDeepSeek
    ? {
        model: config.model,
        messages: [{ role: "system", content: instructions }, ...messages],
      }
    : {
        model: config.model,
        reasoning: { effort: "low" },
        instructions,
        input: messages,
      };

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  let outputText = "";

  if (response.ok) {
    const data = JSON.parse(responseText);
    outputText = isDeepSeek ? String(data?.choices?.[0]?.message?.content || "") : extractOpenAIText(data);
  }

  return { response, responseText, outputText };
}

export function buildProviderError(statusCode, responseText, config) {
  const rawMessage = parseProviderError(responseText);

  if (statusCode === 401) {
    return { error: `${config.apiKeyName} 无效，请检查模型平台密钥。` };
  }

  if (statusCode === 403) {
    return { error: `当前 API Key 没有调用该模型的权限，请检查 ${config.modelName}。` };
  }

  if (statusCode === 404 || /model/i.test(rawMessage)) {
    return { error: `${config.modelName} 配置的模型不可用，请检查模型名称。` };
  }

  if (statusCode === 429 || /quota|billing|rate/i.test(rawMessage)) {
    return { error: "模型平台额度、计费或限流不足，请稍后重试。" };
  }

  return {
    error: "AI 模型调用失败，请稍后重试或检查后端模型配置。",
    detail: rawMessage.slice(0, 220),
  };
}
