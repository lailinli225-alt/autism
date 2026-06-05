import {
  autismInterventionSkills,
  autismSkillSafetyPolicy,
  getAutismInterventionSkill,
} from "../src/data/autismInterventionSkills.js";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = "gpt-5-mini";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";

const teacherProfiles = {
  "zou-xiaobing-bsr": {
    name: "邹老师",
    label: "BSR 结构化社交行为视角",
  },
  "guo-yanqing-aba-core": {
    name: "郭老师",
    label: "ABA 行为分析视角",
  },
  "gutstein-rdi": {
    name: "古特斯坦",
    label: "RDI 关系发展视角",
  },
  "winner-social-thinking": {
    name: "温娜",
    label: "社交思维视角",
  },
  "greenspan-dir-floortime": {
    name: "格林斯潘",
    label: "DIR/Floortime 发展视角",
  },
  integrated: {
    name: "宗老师",
    label: "综合流派视角",
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

function getTeacherContext(teacherId) {
  const teacher = teacherProfiles[teacherId] || teacherProfiles.integrated;

  if (teacherId === "integrated") {
    return {
      teacherId,
      teacher,
      skills: autismInterventionSkills.map(compactSkill),
    };
  }

  const skill = getAutismInterventionSkill(teacherId);
  if (!skill) {
    return null;
  }

  return {
    teacherId,
    teacher,
    skills: [compactSkill(skill)],
  };
}

function modelInstructions() {
  return [
    "你是自闭症家庭支持应用里的深度问答助手。",
    "你不是医生，不替代诊断、医疗、康复评估或个训方案，也不要声称自己是任何专家本人。",
    "必须基于给定 Skill 的公开原则和当前对话历史回答家长。",
    "如果信息不足，先追问 1-3 个关键问题；如果信息足够，再给原因分析、处理原则和家庭可执行动作。",
    "回答要中文、温和、具体、可操作。避免空泛鼓励、保证疗效、责备家长、羞辱孩子、强迫眼神接触或压制自我调节。",
    "如果出现自伤、攻击、走失、明显退行、睡眠饮食急剧恶化、疑似癫痫或无法保证安全，必须建议尽快联系专业人员。",
  ].join("\n");
}

function buildContext({ teacherContext, profile }) {
  return JSON.stringify(
    {
      task: "请作为深度问答角色继续和家长对话。不要一次性套模板，要根据对话信息决定追问或给方案。",
      selectedTeacher: teacherContext.teacher,
      childProfile: profile,
      skills: teacherContext.skills,
      safetyPolicy: autismSkillSafetyPolicy,
      answerContract: [
        "先回应家长当前最困惑的点。",
        "如果信息不足，只追问最关键的 1-3 个问题。",
        "如果信息足够，按：可能原因、现在怎么做、接下来 24 小时可执行动作、需要记录的指标 来回答。",
        "每次建议都要具体到家长说什么、做什么、观察什么。",
      ],
    },
    null,
    2,
  );
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

function parseProviderError(responseText) {
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

function buildProviderError(statusCode, responseText, config) {
  const rawMessage = parseProviderError(responseText);

  if (statusCode === 401) {
    return {
      error: `${config.apiKeyName} 无效。请确认 Vercel 环境变量里填的是对应平台生成的 API Key。`,
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

async function callOpenAI(config, payload) {
  const input = [
    { role: "system", content: modelInstructions() },
    { role: "user", content: buildContext(payload) },
    ...payload.messages,
  ];
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      reasoning: { effort: "low" },
      input,
    }),
  });
  const responseText = await response.text();

  return {
    response,
    responseText,
    outputText: response.ok ? extractOutputText(JSON.parse(responseText)) : "",
  };
}

async function callDeepSeek(config, payload) {
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
          content: buildContext(payload),
        },
        ...payload.messages,
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

  let profile;
  let messages;
  let teacherContext;
  try {
    const body = parseBody(req);
    profile = normalizeProfile(body.profile);
    messages = normalizeMessages(body.messages);
    teacherContext = getTeacherContext(String(body.teacherId || "integrated"));
  } catch {
    return sendJson(res, 400, { error: "请求体不是有效 JSON。" });
  }

  if (!teacherContext) {
    return sendJson(res, 400, { error: "请选择有效的流派老师。" });
  }

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!lastUserMessage) {
    return sendJson(res, 400, { error: "请先输入你想问的问题。" });
  }

  let modelResponse;
  let responseText;
  let outputText;
  try {
    const payload = { teacherContext, profile, messages };
    const result = provider === "deepseek" ? await callDeepSeek(config, payload) : await callOpenAI(config, payload);
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

  const reply = outputText.trim();
  if (!reply) {
    return sendJson(res, 502, { error: "AI 没有返回有效回复，请重试。" });
  }

  return sendJson(res, 200, {
    reply,
    model: config.model,
    provider,
    teacher: teacherContext.teacher,
  });
}
