import {
  autismInterventionSkills,
  autismSkillSafetyPolicy,
} from "../src/data/autismInterventionSkills.js";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = "gpt-5-mini";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";

const skillNames = {
  "zou-xiaobing-bsr": {
    name: "邹小兵",
    label: "BSR/结构化社交行为视角",
  },
  "guo-yanqing-aba-core": {
    name: "郭延庆",
    label: "机会-练习-强化视角",
  },
  "gutstein-rdi": {
    name: "Steven Gutstein / RDI",
    label: "关系发展视角",
  },
  "winner-social-thinking": {
    name: "Michelle Garcia Winner",
    label: "社交思维视角",
  },
  "greenspan-dir-floortime": {
    name: "Stanley Greenspan / DIR",
    label: "DIR/Floortime 发展视角",
  },
};

function setCorsHeaders(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || req.headers?.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  return req.body;
}

function normalizeForm(form = {}) {
  return {
    age: String(form.age || "未填写").slice(0, 40),
    concern: String(form.concern || "").trim().slice(0, 600),
    scene: String(form.scene || "未填写").slice(0, 80),
    severity: String(form.severity || "未填写").slice(0, 20),
    tried: String(form.tried || "").trim().slice(0, 600),
  };
}

function normalizeProfile(profile = {}) {
  return {
    nickname: String(profile.nickname || "孩子").slice(0, 40),
    age: String(profile.age || "未填写").slice(0, 40),
    gender: String(profile.gender || "未填写").slice(0, 20),
    language: String(profile.language || "未填写").slice(0, 80),
    risk: String(profile.risk || "未填写").slice(0, 120),
    goal: String(profile.goal || "").trim().slice(0, 300),
  };
}

function compactSkill(skill) {
  return {
    id: skill.id,
    displayName: skill.displayName,
    expertReference: skill.expertReference,
    sourceBasis: skill.sourceBasis,
    reasoningSteps: skill.reasoningSteps,
    outputContract: skill.outputContract,
    interventionPlaybook: skill.interventionPlaybook,
    promptTemplate: skill.promptTemplate,
  };
}

function buildInput(form, profile) {
  return JSON.stringify(
    {
      task:
        "基于同一个自闭症儿童家庭问题，分别调用 5 个干预 Skill 的逻辑，生成中文、具体、可执行、非诊断的家长支持报告。",
      formatRequirement: "必须只返回合法 JSON 对象，不要 Markdown，不要解释文字，不要使用代码块。",
      case: form,
      childProfile: profile,
      skills: autismInterventionSkills.map(compactSkill),
      safetyPolicy: autismSkillSafetyPolicy,
      outputShape: {
        names: ["识别到的主要问题类型，2-4 个短语"],
        skills: [
          {
            id: "必须使用给定 skill id",
            name: "专家或流派名",
            label: "视角标签",
            core: "该 Skill 对本案例的核心判断，一句话",
            reasons: ["可能原因，3-5 条"],
            principles: ["处理原则，3-5 条"],
            actions: ["家长可执行动作，3-5 条，必须具体到场景和动作"],
            weekPlan: "未来 7 天最小可执行计划，一句话",
          },
        ],
        summary: {
          priority: "综合流派的优先方向",
          firstStep: "今天或未来 7 天第一步",
          warning: "安全和专业支持提醒",
        },
      },
    },
    null,
    2,
  );
}

function modelInstructions() {
  return "你是自闭症家庭支持应用的后端分析器。你不是医生，不替代诊疗，不冒充任何专家本人。必须基于给定 Skill 的公开原则分别分析同一个案例，给家长可执行建议。只输出一个 JSON 对象，不要 Markdown，不要代码块，不要额外解释。";
}

function extractOutputText(data) {
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

function extractChatCompletionText(data) {
  return String(data?.choices?.[0]?.message?.content || "");
}

function parseModelJson(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const cleaned = fencedMatch ? fencedMatch[1] : trimmed;

  return JSON.parse(cleaned);
}

function asList(value, fallback) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 5);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return fallback;
}

function normalizeReport(rawReport) {
  const rawSkills = Array.isArray(rawReport?.skills) ? rawReport.skills : [];
  const byId = new Map(rawSkills.map((skill) => [skill.id, skill]));

  const skills = autismInterventionSkills.map((skill) => {
    const rawSkill = byId.get(skill.id) || {};
    const names = skillNames[skill.id] || {};

    return {
      id: skill.id,
      name: String(rawSkill.name || names.name || skill.expertReference?.name || skill.displayName),
      label: String(rawSkill.label || names.label || skill.displayName),
      core: String(rawSkill.core || skill.sourceBasis?.[0] || "基于该流派公开原则进行分析。"),
      result: {
        reasons: asList(rawSkill.reasons, ["模型未返回足够原因，请补充更具体的场景后重试。"]),
        principles: asList(rawSkill.principles, ["先确保安全，再降低压力，并把目标拆成可执行小步骤。"]),
        actions: asList(rawSkill.actions, ["记录触发点、持续时间和恢复方式，必要时寻求专业支持。"]),
        weekPlan: String(rawSkill.weekPlan || "未来 7 天只追踪一个核心指标，并每天复盘一次。"),
      },
    };
  });

  return {
    names: asList(rawReport?.names, ["需要更多具体情境"]),
    skills,
    summary: {
      priority: String(rawReport?.summary?.priority || "先降低压力和安全风险，再选择一个可观察的小目标练习。"),
      firstStep: String(rawReport?.summary?.firstStep || "今天先记录一次完整情境：前因、行为、后果和恢复方式。"),
      warning: String(
        rawReport?.summary?.warning ||
          "如果出现自伤、攻击、退行、睡眠饮食急剧恶化或无法保证安全，应尽快联系专业人员。",
      ),
    },
  };
}

function parseOpenAIError(responseText) {
  try {
    const parsed = JSON.parse(responseText);
    return String(parsed?.error?.message || parsed?.message || "").trim();
  } catch {
    return responseText.trim();
  }
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

function getProviderConfig(provider) {
  if (provider === "deepseek") {
    const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
    return {
      apiKey: process.env.DEEPSEEK_API_KEY,
      apiKeyName: "DEEPSEEK_API_KEY",
      model: process.env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL,
      modelName: "DEEPSEEK_MODEL",
      url: `${baseUrl}/chat/completions`,
    };
  }

  return {
    apiKey: process.env.OPENAI_API_KEY,
    apiKeyName: "OPENAI_API_KEY",
    model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    modelName: "OPENAI_MODEL",
    url: OPENAI_RESPONSES_URL,
  };
}

async function callOpenAI(config, form, profile) {
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      reasoning: { effort: "low" },
      instructions: modelInstructions(),
      input: buildInput(form, profile),
    }),
  });
  const responseText = await response.text();

  return {
    response,
    responseText,
    outputText: response.ok ? extractOutputText(JSON.parse(responseText)) : "",
  };
}

async function callDeepSeek(config, form, profile) {
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "system",
          content: modelInstructions(),
        },
        {
          role: "user",
          content: buildInput(form, profile),
        },
      ],
    }),
  });
  const responseText = await response.text();

  return {
    response,
    responseText,
    outputText: response.ok ? extractChatCompletionText(JSON.parse(responseText)) : "",
  };
}

function buildProviderError(statusCode, responseText, config) {
  const rawMessage = parseOpenAIError(responseText);

  if (statusCode === 401) {
    return {
      error: `${config.apiKeyName} 无效。请确认 Vercel 环境变量里填的是对应平台生成的 API Key，不要填 GitHub SSH Key 或 ChatGPT 登录密码。`,
    };
  }

  if (statusCode === 403) {
    return {
      error: `当前 API Key 没有调用该模型的权限。请检查平台项目权限，或把 ${config.modelName} 改成默认模型。`,
    };
  }

  if (statusCode === 404 || /model/i.test(rawMessage)) {
    return {
      error: `${config.modelName} 配置的模型不可用。请删除该变量使用默认模型，或改成该平台当前支持的模型。`,
    };
  }

  if (statusCode === 429 || /quota|billing|rate/i.test(rawMessage)) {
    return {
      error: "模型平台额度、计费或限流不足。请检查账户余额、Billing/Usage 或稍后重试。",
    };
  }

  return {
    error: "AI 模型调用失败，请稍后重试或检查后端模型配置。",
    detail: rawMessage.slice(0, 220),
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

  const provider = getProvider();
  const config = getProviderConfig(provider);

  if (!config.apiKey) {
    return sendJson(res, 500, {
      error: `后端还没有配置 ${config.apiKeyName}，暂时无法调用 ${provider} 模型。`,
    });
  }

  let form;
  let profile;
  try {
    const body = parseBody(req);
    form = normalizeForm(body.form);
    profile = normalizeProfile(body.profile);
  } catch {
    return sendJson(res, 400, { error: "请求体不是有效 JSON。" });
  }

  if (!form.concern) {
    return sendJson(res, 400, { error: "请先填写孩子当前问题。" });
  }

  let modelResponse;
  let responseText;
  let outputText;
  try {
    const result = provider === "deepseek" ? await callDeepSeek(config, form, profile) : await callOpenAI(config, form, profile);
    modelResponse = result.response;
    responseText = result.responseText;
    outputText = result.outputText;
  } catch {
    return sendJson(res, 502, {
      error: `后端无法连接 ${provider} 模型服务，请稍后重试。`,
    });
  }

  if (!modelResponse.ok) {
    return sendJson(res, 502, {
      ...buildProviderError(modelResponse.status, responseText, config),
      providerStatus: modelResponse.status,
    });
  }

  let report;
  try {
    report = normalizeReport(parseModelJson(outputText));
  } catch {
    return sendJson(res, 502, {
      error: "AI 返回内容无法解析为结构化报告，请重试。",
    });
  }

  return sendJson(res, 200, {
    analysis: report,
    model: config.model,
    provider,
  });
}
