const DEFAULT_OPENAI_MODEL = "gpt-5-mini";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function getProvider() {
  const configuredProvider = String(process.env.AI_PROVIDER || "").trim().toLowerCase();

  if (configuredProvider === "deepseek" || configuredProvider === "openai") {
    return configuredProvider;
  }

  if (process.env.DEEPSEEK_API_KEY && !process.env.OPENAI_API_KEY) {
    return "deepseek";
  }

  return "openai";
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Only GET is supported." });
  }

  const provider = getProvider();
  const usingDeepSeek = provider === "deepseek";
  const apiKeyName = usingDeepSeek ? "DEEPSEEK_API_KEY" : "OPENAI_API_KEY";
  const modelName = usingDeepSeek ? "DEEPSEEK_MODEL" : "OPENAI_MODEL";
  const model = usingDeepSeek
    ? process.env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL
    : process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;

  return sendJson(res, 200, {
    ok: true,
    provider,
    apiKeyName,
    hasApiKey: Boolean(process.env[apiKeyName]),
    modelName,
    model,
  });
}
