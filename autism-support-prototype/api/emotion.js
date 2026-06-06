import {
  buildProviderError,
  callModel,
  getProviderConfig,
  normalizeProfile,
  parseBody,
  sendJson,
  setCorsHeaders,
} from "../server/aiProvider.js";

function normalizeMessages(messages = []) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message) => message?.role === "user" || message?.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").trim().slice(0, 1200),
    }))
    .filter((message) => message.content)
    .slice(-12);
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Only POST is supported." });
  }

  const config = getProviderConfig();
  if (!config.apiKey) {
    return sendJson(res, 500, { error: `后端还没有配置 ${config.apiKeyName}。` });
  }

  let profile;
  let messages;
  try {
    const body = parseBody(req);
    profile = normalizeProfile(body.profile);
    messages = normalizeMessages(body.messages);
  } catch {
    return sendJson(res, 400, { error: "请求体不是有效 JSON。" });
  }

  if (![...messages].reverse().some((message) => message.role === "user")) {
    return sendJson(res, 400, { error: "请先写下你此刻最难受的部分。" });
  }

  const instructions = [
    "你是面向自闭症家长的情绪陪伴助手。",
    "首要任务是倾听、准确复述感受、降低羞耻和自责，不急着分析孩子，也不主动输出干预训练方案。",
    "每次回复控制在 80-220 个中文字符，语气温柔但不夸张，不说空泛鸡汤。",
    "可以问一个轻量问题帮助家长继续表达；只有家长明确询问怎么办时，才给一个非常小的自我照顾建议。",
    "不要承诺永远陪伴，不制造依赖，不贬低其他家庭成员或专业人员。",
    "如家长表达自伤、自杀、伤害孩子或无法保证安全的想法，立即建议联系身边可信任的人、当地急救或危机干预资源，并优先远离危险工具和确保孩子安全。",
  ].join("\n");
  const context = JSON.stringify({
    childProfile: profile,
    roleBoundary: "只承接家长情绪，不替代心理治疗或危机干预。",
  });

  let result;
  try {
    result = await callModel(config, {
      instructions,
      messages: [{ role: "user", content: context }, ...messages],
    });
  } catch {
    return sendJson(res, 502, { error: `后端无法连接 ${config.provider} 模型服务，请稍后重试。` });
  }

  if (!result.response.ok) {
    return sendJson(res, 502, {
      ...buildProviderError(result.response.status, result.responseText, config),
      providerStatus: result.response.status,
    });
  }

  const reply = result.outputText.trim();
  if (!reply) {
    return sendJson(res, 502, { error: "AI 没有返回有效回复，请重试。" });
  }

  return sendJson(res, 200, {
    reply,
    provider: config.provider,
    model: config.model,
  });
}
