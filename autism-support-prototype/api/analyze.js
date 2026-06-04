import {
  autismInterventionSkills,
  autismSkillSafetyPolicy,
} from "../src/data/autismInterventionSkills.js";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.5";

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

function buildInput(form) {
  return JSON.stringify(
    {
      task:
        "基于同一个自闭症儿童家庭问题，分别调用 5 个干预 Skill 的逻辑，生成中文、具体、可执行、非诊断的家长支持报告。",
      case: form,
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

function parseModelJson(text) {
  const trimmed = text.trim();
  const cleaned = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

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

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Only POST is supported." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 500, {
      error: "后端还没有配置 OPENAI_API_KEY，暂时无法调用 AI 模型。",
    });
  }

  let form;
  try {
    const body = parseBody(req);
    form = normalizeForm(body.form);
  } catch {
    return sendJson(res, 400, { error: "请求体不是有效 JSON。" });
  }

  if (!form.concern) {
    return sendJson(res, 400, { error: "请先填写孩子当前问题。" });
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  let openaiResponse;
  let responseText;
  try {
    openaiResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        reasoning: { effort: "low" },
        instructions:
          "你是自闭症家庭支持应用的后端分析器。你不是医生，不替代诊疗，不冒充任何专家本人。必须基于给定 Skill 的公开原则分别分析同一个案例，给家长可执行建议。只输出一个 JSON 对象，不要 Markdown，不要代码块，不要额外解释。",
        input: buildInput(form),
      }),
    });
    responseText = await openaiResponse.text();
  } catch {
    return sendJson(res, 502, {
      error: "后端无法连接 AI 模型服务，请稍后重试。",
    });
  }

  if (!openaiResponse.ok) {
    return sendJson(res, 502, {
      error: "AI 模型调用失败，请稍后重试或检查后端模型配置。",
      detail: responseText.slice(0, 400),
    });
  }

  let report;
  try {
    const responseData = JSON.parse(responseText);
    const outputText = extractOutputText(responseData);
    report = normalizeReport(parseModelJson(outputText));
  } catch {
    return sendJson(res, 502, {
      error: "AI 返回内容无法解析为结构化报告，请重试。",
    });
  }

  return sendJson(res, 200, {
    analysis: report,
    model,
  });
}
