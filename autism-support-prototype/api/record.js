import {
  buildProviderError,
  callModel,
  getProviderConfig,
  normalizeProfile,
  normalizeRecords,
  parseBody,
  parseModelJson,
  sendJson,
  setCorsHeaders,
} from "../server/aiProvider.js";

function normalizeRecord(record = {}) {
  return {
    date: String(record.date || "").slice(0, 40),
    target: String(record.target || "").slice(0, 80),
    note: String(record.note || "").trim().slice(0, 1200),
    cooperation: Math.max(1, Math.min(5, Number(record.cooperation) || 1)),
    emotion: Math.max(1, Math.min(5, Number(record.emotion) || 1)),
    support: Math.max(1, Math.min(5, Number(record.support) || 1)),
  };
}

function normalizeResult(raw, record) {
  const score = Math.max(0, Math.min(100, Math.round(Number(raw?.score) || 60)));

  return {
    id: Date.now(),
    date: record.date,
    target: record.target,
    note: record.note,
    cooperation: record.cooperation,
    emotion: record.emotion,
    support: record.support,
    score,
    trigger: String(raw?.trigger || "暂时无法确定，需要继续记录发生前的情境。"),
    behavior: String(raw?.behavior || record.note),
    intervention: String(raw?.intervention || "保留有效支持，并一次只调整一个变量。"),
    reaction: String(raw?.reaction || "需要结合持续时间、成功次数和恢复方式继续观察。"),
    next: String(raw?.next || "下次继续记录触发点、辅助等级和恢复时间。"),
    metric: String(raw?.metric || "记录成功次数、持续时间和辅助等级。"),
    encouragement: String(raw?.encouragement || "你已经完成了重要的一步：把过程记录下来。"),
  };
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
  let record;
  let recentRecords;
  try {
    const body = parseBody(req);
    profile = normalizeProfile(body.profile);
    record = normalizeRecord(body.record);
    recentRecords = normalizeRecords(body.recentRecords);
  } catch {
    return sendJson(res, 400, { error: "请求体不是有效 JSON。" });
  }

  if (!record.note) {
    return sendJson(res, 400, { error: "请先写下今天做了什么和孩子的反应。" });
  }

  const instructions = [
    "你是自闭症家庭干预记录整理助手，不是医生，不替代诊疗。",
    "把家长的自然语言记录整理成可追溯、可复盘的结构化信息。",
    "不能虚构家长没有提供的事实。无法确定时明确写需要继续观察。",
    "评分用于反映本次目标完成、情绪稳定和辅助程度的综合状态，不评价孩子或家长好坏。",
    "只返回合法 JSON，不要 Markdown 或解释。",
  ].join("\n");
  const input = JSON.stringify({
    childProfile: profile,
    currentRecord: record,
    recentRecords,
    outputShape: {
      score: "0-100 整数",
      trigger: "可能触发点或前因",
      behavior: "可观察的孩子行为",
      intervention: "家长实际使用的支持方式及其中有效部分",
      reaction: "孩子反应和恢复情况",
      next: "下一次只调整一个变量的具体建议",
      metric: "下次需要记录的 1-3 个量化指标",
      encouragement: "一句具体、不过度夸张的家长支持",
    },
  });

  let result;
  try {
    result = await callModel(config, {
      instructions,
      messages: [{ role: "user", content: input }],
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

  let structured;
  try {
    structured = normalizeResult(parseModelJson(result.outputText), record);
  } catch {
    return sendJson(res, 502, { error: "AI 返回的记录无法解析，请重试。" });
  }

  return sendJson(res, 200, {
    record: structured,
    provider: config.provider,
    model: config.model,
  });
}
