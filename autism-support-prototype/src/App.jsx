import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardPen,
  FileText,
  HeartHandshake,
  Home,
  Lightbulb,
  LockKeyhole,
  MessageCircle,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { autismInterventionSkills } from "./data/autismInterventionSkills.js";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const initialProfile = {
  nickname: "安安",
  age: "6 岁",
  gender: "男",
  language: "能表达需求",
  risk: "无明显安全风险",
  goal: "提升等待、沟通和情绪调节能力",
};

const initialCase = {
  concern: "",
  scene: "家庭日常转换",
  severity: "中等",
  tried: "",
};

const moduleCards = [
  {
    id: "solution",
    title: "方案输出",
    desc: "针对一个具体问题生成综合答案与 7 日计划",
    icon: FileText,
    tone: "green",
  },
  {
    id: "deepqa",
    title: "深度问答",
    desc: "选择流派老师，连续追问和深入分析",
    icon: MessageCircle,
    tone: "blue",
  },
  {
    id: "record",
    title: "干预记录",
    desc: "记录每天做了什么，AI 整理成可追溯数据",
    icon: ClipboardPen,
    tone: "amber",
  },
  {
    id: "articles",
    title: "精品好文",
    desc: "按标签沉淀专家文章、理论和家长经验",
    icon: BookOpen,
    tone: "plain",
  },
  {
    id: "emotion",
    title: "情绪垃圾桶",
    desc: "温柔承接家长情绪，不急着指导",
    icon: HeartHandshake,
    tone: "teal",
  },
];

const teachers = [
  {
    id: "guo-yanqing-aba-core",
    name: "郭老师",
    label: "ABA 行为分析",
    style: "把问题拆成 ABC、目标行为、替代行为和强化方式。",
  },
  {
    id: "zou-xiaobing-bsr",
    name: "邹老师",
    label: "BSR 结构化社交",
    style: "先看社交阶梯、结构化支持和行为功能。",
  },
  {
    id: "gutstein-rdi",
    name: "古特斯坦",
    label: "RDI 关系发展",
    style: "关注共同调节、动态变化和家长引导关系。",
  },
  {
    id: "winner-social-thinking",
    name: "温娜",
    label: "社交思维",
    style: "帮助孩子理解情境、他人想法和社交期待。",
  },
  {
    id: "greenspan-dir-floortime",
    name: "格林斯潘",
    label: "DIR 地板时光",
    style: "从发展阶段、感官差异和情感互动进入。",
  },
  {
    id: "integrated",
    name: "宗老师",
    label: "综合流派",
    style: "综合多流派，给出优先级和家庭可执行方案。",
  },
];

const articles = [
  {
    id: 1,
    tag: "干预方法",
    title: "如何把孩子的哭闹转成可记录的 ABC",
    desc: "用前因、行为、后果看见问题背后的功能。",
    readingTime: "6 分钟",
    takeaway: "先记录完整情境，再决定要改变前因、替代行为还是后果。",
    content: [
      "ABC 不是给孩子贴标签，而是把一次事件拆成三个可观察部分：发生前有什么，孩子具体做了什么，成人和环境随后发生了什么。",
      "记录时避免写“故意闹”“不听话”这类判断。可以改成：妈妈说要关掉平板后，孩子哭喊、趴地约 4 分钟；妈妈把平板又打开 2 分钟后停止哭喊。",
      "连续记录 3 到 5 次后再看规律。如果多数发生在任务转换前，可以优先增加预告和视觉提示；如果孩子用哭闹获得休息，则需要同时教授“休息一下”的替代表达。",
      "家庭练习只改一个变量，并记录频率、持续时间或恢复时间。这样才能判断变化来自哪里。",
    ],
    source: "基于应用行为分析的 ABC 记录原则整理",
  },
  {
    id: 2,
    tag: "前沿理论",
    title: "关系发展视角下，为什么微小变化很重要",
    desc: "在可预测框架里练习弹性，而不是突然挑战。",
    readingTime: "5 分钟",
    takeaway: "保留熟悉框架，只加入一个孩子能够承受的小变化。",
    content: [
      "一些孩子能完成熟悉流程，却在顺序、人物或材料发生变化时明显焦虑。关系发展视角关注孩子如何和成人共同面对不确定，而不只是完成指令。",
      "练习变化时，不需要故意制造很大的意外。可以在熟悉的收玩具流程里，只改变一个盒子的位置；在固定散步路线里，只增加一个短暂停顿。",
      "成人先保持平静，用“我们一起看看”“这里有一点不一样”这样的分享式语言代替连续提问。孩子紧张时退回已经成功的共同动作。",
      "衡量进步时，可以记录孩子恢复所需时间、是否愿意参考成人以及是否能继续共同活动。",
    ],
    source: "基于 RDI 动态智能与共同调节公开原则整理",
  },
  {
    id: 3,
    tag: "家长经验",
    title: "入园分离困难的 7 天家庭练习复盘",
    desc: "从少哭 1 分钟开始，建立孩子和家长的成功感。",
    readingTime: "7 分钟",
    takeaway: "把目标从完全不哭改成完成一个交接动作和更快恢复。",
    content: [
      "第一天先记录分离发生前后的完整过程，包括到达时间、环境声音、老师接手方式、哭闹持续时间和恢复方式。",
      "第二到第四天保持同一套三步流程：提前预告、完成固定交接动作、家长用同一句话离开。不要每天更换奖励或告别方式。",
      "第五天开始，只在孩子已经能恢复的基础上减少一点辅助，例如从牵手交给老师改成孩子主动递交书包。",
      "一周复盘时，重点看恢复时间、交接动作成功次数和老师需要的辅助等级，而不是只看有没有哭。",
    ],
    source: "家庭场景示例，不能替代园所与专业人员的个别化评估",
  },
  {
    id: 4,
    tag: "专家文章",
    title: "社交思维：把隐性规则画出来",
    desc: "用社交地图降低孩子推断情境的压力。",
    readingTime: "5 分钟",
    takeaway: "把“你应该知道”改成看得见的情境线索和行动步骤。",
    content: [
      "很多社交规则没有被明确说出来，例如排队时要和前面的人保持距离、别人正在说话时需要等待。对需要更多明确线索的孩子，这些规则可能并不自然可见。",
      "社交地图可以用四格表达：现在在哪里、别人正在做什么、别人可能期待什么、我可以做什么。文字要短，也可以配照片或简单图标。",
      "先在低压力环境里讲解和演练，不要等到孩子情绪已经升高时才拿出来说教。",
      "复盘时描述具体行为及影响，例如“你停在黄色线后面，前面的人有足够空间”，避免使用“表现好”“懂事”这类模糊评价。",
    ],
    source: "基于 Social Thinking 情境理解与社交地图公开原则整理",
  },
  {
    id: 5,
    tag: "干预方法",
    title: "如何设定一个真正可执行的家庭目标",
    desc: "把“提升能力”改写成一周内能观察和记录的小动作。",
    readingTime: "4 分钟",
    takeaway: "目标必须说明场景、行为、辅助和判断完成的指标。",
    content: [
      "“提升沟通能力”不能直接指导今天做什么。更可执行的目标是：晚饭时，当孩子想要饮料，能在图片提示下递出“要水”卡片，每天练习 3 次。",
      "目标难度应让孩子有机会成功。如果连续两天都无法完成，就先降低动作要求或增加辅助，而不是增加练习次数。",
      "一次只追踪一个主要指标，例如成功次数、持续时间、辅助等级或恢复时间。",
      "达到稳定成功后，再改变一个条件进行泛化，例如换一个人、地点或材料。",
    ],
    source: "基于 SMART 目标和家庭自然情境教学原则整理",
  },
  {
    id: 6,
    tag: "家长经验",
    title: "当计划没有效果时，家长可以先检查什么",
    desc: "不急着否定自己，先检查目标、环境、辅助和记录。",
    readingTime: "4 分钟",
    takeaway: "方案无效不等于家长失败，通常需要调整任务难度或支持方式。",
    content: [
      "先确认目标是否可观察。如果只能用“更听话”“情绪更好”描述，就很难判断变化。",
      "再检查孩子当时的身体和感官状态：困倦、饥饿、噪声、疼痛或任务过密都可能让原本会做的事情变难。",
      "检查辅助是否足够及时。孩子已经明显崩溃后再提示，往往比进入场景前的预告效果弱。",
      "最后看记录是否足够。一次失败不能说明方法无效，连续几次相同场景的数据更有判断价值。",
    ],
    source: "家庭复盘建议，不替代医疗或康复评估",
  },
];

const articleTags = ["全部", "干预方法", "前沿理论", "专家文章", "家长经验"];

const skillVisuals = {
  "zou-xiaobing-bsr": { tone: "green", shortName: "邹小兵 BSR" },
  "guo-yanqing-aba-core": { tone: "amber", shortName: "郭延庆 ABA" },
  "gutstein-rdi": { tone: "blue", shortName: "RDI" },
  "winner-social-thinking": { tone: "violet", shortName: "社交思维" },
  "greenspan-dir-floortime": { tone: "teal", shortName: "DIR 地板时光" },
};

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });

  function update(nextValue) {
    const resolved = typeof nextValue === "function" ? nextValue(value) : nextValue;
    setValue(resolved);
    window.localStorage.setItem(key, JSON.stringify(resolved));
  }

  return [value, update];
}

function todayLabel() {
  return new Date().toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function apiPath(path) {
  return `${apiBaseUrl}${path}`;
}

function isGithubPagesWithoutApi() {
  return !apiBaseUrl && window.location.hostname.endsWith("github.io");
}

function isViteDevWithoutApi() {
  return !apiBaseUrl && window.location.hostname === "127.0.0.1" && window.location.port === "5173";
}

function shouldUseLocalExperience() {
  return isGithubPagesWithoutApi() || isViteDevWithoutApi();
}

function formatApiError(payload) {
  const parts = [payload?.error || "后端模型调用失败"];

  if (payload?.providerStatus) {
    parts.push(`状态码：${payload.providerStatus}`);
  }

  if (payload?.detail) {
    parts.push(`细节：${payload.detail}`);
  }

  return parts.join(" ");
}

function normalizeAnalysis(analysis) {
  const skills = Array.isArray(analysis?.skills) ? analysis.skills : [];
  return {
    names: Array.isArray(analysis?.names) ? analysis.names : ["需要更多具体情境"],
    summary: {
      priority: analysis?.summary?.priority || "先降低压力，再选择一个可观察的小目标练习。",
      firstStep: analysis?.summary?.firstStep || "今天先记录一次完整情境：前因、行为、后果和恢复方式。",
      warning:
        analysis?.summary?.warning ||
        "如果出现自伤、攻击、退行、睡眠饮食急剧恶化或无法保证安全，应尽快联系专业人员。",
    },
    skills: skills.map((skill) => ({
      ...skill,
      tone: skillVisuals[skill.id]?.tone || "green",
      shortName: skillVisuals[skill.id]?.shortName || skill.name,
      result: {
        reasons: skill.result?.reasons || [],
        principles: skill.result?.principles || [],
        actions: skill.result?.actions || [],
        weekPlan: skill.result?.weekPlan || "未来 7 天只追踪一个指标，并每天复盘。",
      },
    })),
  };
}

function buildFallbackAnalysis(caseForm, profile) {
  const concern = caseForm.concern || "孩子当前问题";
  const scene = caseForm.scene || "当前场景";
  const highRisk = profile.risk !== "无明显安全风险" || caseForm.severity === "严重";

  return {
    names: ["当前行为表现", "家庭可执行支持", highRisk ? "安全优先" : "可量化练习"],
    summary: {
      priority: highRisk
        ? "先保证安全和降低情绪强度，再开始任何训练。"
        : `先在“${scene}”里建立一个最小可成功动作，不追求一次解决所有问题。`,
      firstStep: `今天先记录一次完整情境：发生前是什么、孩子做了什么、你如何回应、多久恢复。`,
      warning:
        "如果出现自伤、攻击、冲跑、明显退行或家长无法保证安全，应优先联系专业人员。本工具不替代诊疗。",
    },
    skills: autismInterventionSkills.map((skill) => {
      const visual = skillVisuals[skill.id] || {};
      return {
        id: skill.id,
        name: skill.expertReference?.name || skill.displayName,
        label: visual.shortName || skill.displayName,
        shortName: visual.shortName || skill.displayName,
        tone: visual.tone || "green",
        core: skill.sourceBasis?.[0] || "基于该流派公开原则提供家庭支持。",
        result: {
          reasons: [
            `“${concern}”可能与孩子当前能力和环境要求不匹配有关。`,
            `在“${scene}”里，家长需要先识别触发点和维持因素。`,
            "孩子不是故意为难家长，当前行为可能是在表达压力、需求或理解困难。",
          ],
          principles: skill.outputContract?.slice(0, 3) || [
            "先降低压力，再提高要求。",
            "把目标拆成可观察、可记录的小动作。",
            "每天只调整一个变量。",
          ],
          actions: [
            "设置进入场景前的固定预告：先说明接下来要做什么，再给一个可选择的小动作。",
            "孩子情绪升高时减少讲道理，用短句确认状态，并给安静或休息选择。",
            "完成一个小动作后 10 秒内反馈具体行为，例如“你刚才等了 20 秒”。",
          ],
          weekPlan: "未来 7 天只练一个最小目标，并记录成功次数、持续时间和恢复方式。",
        },
      };
    }),
  };
}

function buildSevenDayPlan(caseForm, profile) {
  const topic = caseForm.concern ? caseForm.concern.slice(0, 18) : "当前问题";
  return [
    ["观察", "记录 2 次完整 ABC", "写下触发点、行为、后果、恢复方式", "完成 2 条记录"],
    ["降压", "降低一个环境压力", "提前预告、减少语言、准备安静选择", "恢复时间缩短 1 分钟"],
    ["最小动作", "定义 1 个可成功动作", `围绕“${topic}”只要求完成一步`, "成功 1 次即可"],
    ["辅助", "给图片/手势/短句提示", "先全辅助，再减少一点提示", "记录辅助等级"],
    ["强化", "及时反馈具体行为", "完成后 10 秒内说出孩子做到了什么", "有效强化出现 3 次"],
    ["泛化", "换一个人或场景练同一目标", "只改变一个条件", "成功率达到 50%"],
    ["复盘", "总结有效方法和下周目标", `结合${profile.nickname}的反应调整难度`, "形成下周 1 个目标"],
  ].map(([dayFocus, goal, action, metric], index) => ({
    day: `第 ${index + 1} 天`,
    dayFocus,
    goal,
    action,
    metric,
  }));
}

function structureRecord(record) {
  const score = Math.max(35, Math.min(96, 100 - Number(record.emotion) * 9 - Number(record.support) * 5 + Number(record.cooperation) * 8));
  return {
    id: Date.now(),
    date: record.date || todayLabel(),
    target: record.target,
    note: record.note,
    score,
    trigger: record.note.includes("声音") || record.note.includes("吵") ? "声音/环境刺激" : "任务要求或转换压力",
    behavior: record.note,
    intervention: record.note.includes("预告") ? "提前预告 + 降低语言 + 及时反馈" : "家长支持 + 环境调整 + 记录复盘",
    reaction: Number(record.emotion) <= 2 ? "情绪强度较低，能较快恢复" : "情绪有波动，需要继续降低要求",
    next: Number(record.support) >= 3 ? "下次把目标再拆小，并减少同时出现的要求" : "下次可延长 15-30 秒或换一个相近场景练习",
    metric: "记录成功次数、持续时间和辅助等级。",
    encouragement: "你已经把今天的过程记录下来，这会让下一次调整更有依据。",
  };
}

function AppShell({ route, setRoute, profile, children, title, subtitle, showBack = true }) {
  return (
    <main className="phone-shell">
      <header className="app-header">
        <div className="header-row">
          {showBack ? (
            <button className="icon-button" type="button" onClick={() => setRoute("home")} aria-label="返回主页">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="brand-mini">
              <HeartHandshake size={22} />
            </div>
          )}
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <button className="avatar-button" type="button" onClick={() => setRoute("profile")}>
            {profile.nickname.slice(0, 1)}
          </button>
        </div>
      </header>
      <section className="screen-content">{children}</section>
      <BottomNav route={route} setRoute={setRoute} />
    </main>
  );
}

function BottomNav({ route, setRoute }) {
  const items = [
    ["home", "主页", Home],
    ["record", "记录", ClipboardPen],
    ["analysis", "分析", BarChart3],
    ["profile", "档案", Users],
  ];

  return (
    <nav className="bottom-nav" aria-label="主导航">
      {items.map(([id, label, Icon]) => (
        <button className={route === id ? "active" : ""} type="button" key={id} onClick={() => setRoute(id)}>
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function Registration({ onSave }) {
  const [form, setForm] = useState(initialProfile);
  const [status, setStatus] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit() {
    if (!form.nickname.trim() || !form.age.trim() || !form.goal.trim()) {
      setStatus("请至少填写孩子昵称、年龄和当前最希望改善的目标。");
      return;
    }
    setStatus("");
    onSave({
      ...form,
      nickname: form.nickname.trim(),
      age: form.age.trim(),
      goal: form.goal.trim(),
    });
  }

  return (
    <main className="register-shell">
      <div className="register-card">
        <div className="brand-large">
          <HeartHandshake size={34} />
        </div>
        <h1>先建立孩子的小档案</h1>
        <p>只收集生成建议最必要的信息。后续可以慢慢补充。</p>

        <div className="form-stack">
          <TextInput label="孩子昵称" value={form.nickname} onChange={(value) => update("nickname", value)} />
          <div className="two-col">
            <TextInput label="年龄" value={form.age} onChange={(value) => update("age", value)} />
            <SelectInput label="性别" value={form.gender} options={["男", "女", "暂不填写"]} onChange={(value) => update("gender", value)} />
          </div>
          <SelectInput
            label="语言能力"
            value={form.language}
            options={["不会说话", "单词/短句", "能表达需求", "能简单对话", "会说但社交沟通困难"]}
            onChange={(value) => update("language", value)}
          />
          <SelectInput
            label="安全风险"
            value={form.risk}
            options={["无明显安全风险", "有自伤", "有攻击他人", "会冲跑/走失", "严重睡眠或饮食问题"]}
            onChange={(value) => update("risk", value)}
          />
          <TextAreaInput label="家长期望目标" value={form.goal} onChange={(value) => update("goal", value)} />
        </div>

        {status ? <p className="inline-alert">{status}</p> : null}
        <button className="primary-button" type="button" onClick={submit}>
          完成建档，进入主页
          <ChevronRight size={18} />
        </button>
      </div>
    </main>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectInput({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaInput({ label, value, onChange, placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function HomeScreen({ profile, setRoute, records, reports }) {
  const latestRecord = records[0];
  return (
    <div className="stack">
      <section className="hero-card">
        <div>
          <span className="eyebrow">{todayLabel()}</span>
          <h2>上午好，{profile.nickname}家长</h2>
          <p>今天先完成一个小步骤，不需要一次解决所有问题。</p>
        </div>
        <button type="button" onClick={() => setRoute("solution")}>
          问一个问题
          <ChevronRight size={18} />
        </button>
      </section>

      <section className="priority-card">
        <div className="card-heading">
          <Lightbulb size={22} />
          <div>
            <h3>今日优先支持</h3>
            <p>{reports[0]?.analysis?.summary?.firstStep || profile.goal}</p>
          </div>
        </div>
        <div className="mini-metrics">
          <span>建议练习</span>
          <strong>{latestRecord ? latestRecord.target : "等待/沟通/情绪调节"}</strong>
        </div>
      </section>

      <section>
        <SectionTitle title="五大入口" action="每次只选一个任务" />
        <div className="module-grid">
          {moduleCards.map((card) => (
            <FeatureCard {...card} key={card.id} onClick={() => setRoute(card.id)} />
          ))}
        </div>
      </section>

      <section className="card">
        <SectionTitle title="最近变化" action="自动汇总记录" />
        {latestRecord ? (
          <div className="record-summary">
            <strong>{latestRecord.target}</strong>
            <p>有效方法：{latestRecord.intervention}</p>
            <p>下次调整：{latestRecord.next}</p>
          </div>
        ) : (
          <p className="muted">还没有干预记录。记录一次后，这里会显示有效方法和下次调整。</p>
        )}
      </section>
    </div>
  );
}

function FeatureCard({ title, desc, icon: Icon, tone, onClick }) {
  return (
    <button className={`feature-card ${tone}`} type="button" onClick={onClick}>
      <span className="feature-icon">
        <Icon size={23} />
      </span>
      <strong>{title}</strong>
      <p>{desc}</p>
    </button>
  );
}

function SectionTitle({ title, action }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {action ? <span>{action}</span> : null}
    </div>
  );
}

function SolutionScreen({ profile, records, onSaveReport }) {
  const [form, setForm] = useState(initialCase);
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    const nextForm = { ...form, concern: form.concern.trim(), tried: form.tried.trim() };
    if (!nextForm.concern) {
      setStatus("请先写下一个具体问题。");
      return;
    }

    setLoading(true);
    setStatus("");
    let source = "DeepSeek / AI 模型";
    let analysis;

    if (shouldUseLocalExperience()) {
      analysis = buildFallbackAnalysis(nextForm, profile);
      source = "本地体验版";
      setStatus("当前环境没有后端 API，已生成本地体验版；部署到 Vercel 后会调用 DeepSeek。");
    } else {
      try {
        const response = await fetch(apiPath("/api/analyze"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ form: nextForm, profile, recentRecords: records }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(formatApiError(payload));
        }
        analysis = normalizeAnalysis(payload.analysis);
        source = payload.provider ? `${payload.provider} · ${payload.model || "模型"}` : "AI 模型";
        setStatus("");
      } catch (error) {
        setReport(null);
        setStatus(`模型调用失败：${error.message}`);
        setLoading(false);
        return;
      }
    }
    setLoading(false);

    const nextReport = {
      id: Date.now(),
      form: nextForm,
      analysis,
      plan: buildSevenDayPlan(nextForm, profile),
      source,
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    setReport(nextReport);
    onSaveReport(nextReport);
  }

  return (
    <div className="stack">
      <section className="card">
        <SectionTitle title="输入当前问题" action="一次只解决一个场景" />
        <div className="form-stack">
          <TextAreaInput
            label="我的问题"
            value={form.concern}
            placeholder="例如：孩子今天一直重复说同一句话，不愿意回应我。"
            onChange={(value) => setForm((current) => ({ ...current, concern: value }))}
          />
          <div className="two-col">
            <SelectInput
              label="场景"
              value={form.scene}
              options={["家庭日常转换", "同伴互动", "课堂/集体活动", "公共场所", "睡眠/饮食/如厕"]}
              onChange={(value) => setForm((current) => ({ ...current, scene: value }))}
            />
            <SelectInput
              label="强度"
              value={form.severity}
              options={["轻微", "中等", "较强", "严重"]}
              onChange={(value) => setForm((current) => ({ ...current, severity: value }))}
            />
          </div>
          <TextAreaInput
            label="已尝试的方法"
            value={form.tried}
            placeholder="例如：讲道理、奖励贴纸、带离现场，哪些有用或没用。"
            onChange={(value) => setForm((current) => ({ ...current, tried: value }))}
          />
        </div>
        {status ? <p className="inline-alert">{status}</p> : null}
        <button className="primary-button" type="button" onClick={generate} disabled={loading}>
          {loading ? "正在生成..." : "生成综合方案"}
          <Sparkles size={18} />
        </button>
      </section>

      {report ? <ReportView report={report} /> : <EmptyState text="生成后会先看到综合方案，再看每个流派的不同解答。" />}
    </div>
  );
}

function ReportView({ report }) {
  return (
    <div className="stack">
      <section className="card success-card">
        <div className="card-heading">
          <Sparkles size={24} />
          <div>
            <h3>综合方案</h3>
            <p>{report.analysis.summary.priority}</p>
          </div>
        </div>
        <div className="answer-grid">
          <article>
            <strong>第一步</strong>
            <p>{report.analysis.summary.firstStep}</p>
          </article>
          <article>
            <strong>安全提醒</strong>
            <p>{report.analysis.summary.warning}</p>
          </article>
        </div>
        <span className="source-chip">{report.source}</span>
      </section>

      <section className="card">
        <SectionTitle title="7 日 SMART 干预计划" action="可量化、可执行" />
        <div className="plan-list">
          {report.plan.map((item) => (
            <article className="plan-item" key={item.day}>
              <span>{item.day}</span>
              <div>
                <strong>{item.dayFocus}：{item.goal}</strong>
                <p>{item.action}</p>
                <small>指标：{item.metric}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <SectionTitle title="各流派解答" action="取长补短" />
        <div className="skill-list">
          {report.analysis.skills.map((skill) => (
            <article className={`skill-card ${skill.tone}`} key={skill.id}>
              <h3>{skill.shortName}</h3>
              <p>{skill.core}</p>
              <ul>
                {skill.result.actions.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function initialDeepQaMessages(teacher) {
  return [
    {
      role: "assistant",
      content: `我是${teacher.name} · ${teacher.label}视角的问答助手。你可以先告诉我：孩子发生了什么、在什么场景、持续多久、你已经尝试过什么。我会先补足关键信息，再给具体建议。`,
    },
  ];
}

function DeepQaScreen({ profile, records }) {
  const [teacher, setTeacher] = useState(teachers[0]);
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useStoredState("care.deepQaSessions", {});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");
  const messages = sessions[teacher.id] || initialDeepQaMessages(teacher);

  function chooseTeacher(nextTeacher) {
    setTeacher(nextTeacher);
    setInput("");
    setStatus("");
    setSource("");
  }

  function resetConversation() {
    setSessions((current) => ({
      ...current,
      [teacher.id]: initialDeepQaMessages(teacher),
    }));
    setInput("");
    setStatus("");
    setSource("");
  }

  function saveMessages(nextMessages) {
    setSessions((current) => ({
      ...current,
      [teacher.id]: nextMessages.slice(-20),
    }));
  }

  async function send() {
    const text = input.trim();
    if (!text) return;
    const nextMessages = [...messages, { role: "user", content: text }];
    setInput("");
    saveMessages(nextMessages);
    setLoading(true);
    setStatus("");

    if (shouldUseLocalExperience()) {
      const reply = `当前环境没有后端 API，已生成本地体验版。部署到 Vercel 后会由 DeepSeek 按${teacher.label}继续追问和回答。先补充 3 点：发生前有什么触发、持续多久、你当时怎么回应？`;
      saveMessages([...nextMessages, { role: "assistant", content: reply }]);
      setSource("本地体验版");
      setStatus("当前环境没有后端 API，部署到 Vercel 后会调用 DeepSeek。");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiPath("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.id,
          profile,
          recentRecords: records,
          messages: nextMessages,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(formatApiError(payload));
      }
      saveMessages([...nextMessages, { role: "assistant", content: payload.reply }]);
      setSource(payload.provider ? `${payload.provider} · ${payload.model || "模型"}` : "AI 模型");
      setStatus("");
    } catch (error) {
      setStatus(`模型调用失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack deepqa-screen">
      <section className="teacher-strip">
        {teachers.map((item) => (
          <button className={teacher.id === item.id ? "active" : ""} type="button" key={item.id} onClick={() => chooseTeacher(item)}>
            <strong>{item.name}</strong>
            <span>{item.label}</span>
          </button>
        ))}
      </section>
      <section className="card teacher-card">
        <div>
          <h2>{teacher.name} · {teacher.label}</h2>
          <p>{teacher.style}</p>
        </div>
        <button className="ghost-button" type="button" onClick={resetConversation}>
          新对话
        </button>
      </section>
      {status ? <p className="inline-alert">{status}</p> : null}
      <section className="chat-card">
        {messages.map((message, index) => (
          <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
            {message.content}
          </div>
        ))}
        {loading ? <div className="message assistant">正在基于{teacher.label}分析...</div> : null}
      </section>
      {source ? <span className="source-chip chat-source">{source}</span> : null}
      <div className="chat-input">
        <input
          value={input}
          placeholder={`向${teacher.name}继续提问...`}
          disabled={loading}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && !loading && send()}
        />
        <button type="button" onClick={send} aria-label="发送" disabled={loading || !input.trim()}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

function RecordScreen({ profile, records, onSaveRecord }) {
  const [record, setRecord] = useState({
    date: todayLabel(),
    target: "等待练习",
    note: "",
    cooperation: 2,
    emotion: 2,
    support: 2,
  });
  const [structured, setStructured] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");

  async function submit() {
    if (!record.note.trim()) {
      setStructured({ error: "请先写下今天做了什么和孩子的反应。" });
      return;
    }

    setLoading(true);
    setStatus("");
    setStructured(null);

    if (shouldUseLocalExperience()) {
      const next = structureRecord(record);
      setStructured(next);
      setSource("本地体验版");
      setStatus("当前环境没有后端 API，部署到 Vercel 后会由 DeepSeek 结构化复盘。");
      onSaveRecord(next);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiPath("/api/record"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          record,
          recentRecords: records,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(formatApiError(payload));
      }
      setStructured(payload.record);
      setSource(payload.provider ? `${payload.provider} · ${payload.model || "模型"}` : "AI 模型");
      onSaveRecord(payload.record);
    } catch (error) {
      setStatus(`模型调用失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <SectionTitle title="今日干预记录" action="3 分钟写完" />
        <div className="form-stack">
          <div className="two-col">
            <TextInput label="日期" value={record.date} onChange={(value) => setRecord((current) => ({ ...current, date: value }))} />
            <SelectInput
              label="目标"
              value={record.target}
              options={["等待练习", "沟通表达", "情绪调节", "入园转换", "同伴互动"]}
              onChange={(value) => setRecord((current) => ({ ...current, target: value }))}
            />
          </div>
          <TextAreaInput
            label="今天做了什么"
            value={record.note}
            placeholder="例如：排队前提前预告，给等待卡。孩子前 30 秒捂耳朵，后来能牵手站在旁边。"
            onChange={(value) => setRecord((current) => ({ ...current, note: value }))}
          />
          <SliderInput label="配合度" value={record.cooperation} onChange={(value) => setRecord((current) => ({ ...current, cooperation: value }))} />
          <SliderInput label="情绪强度" value={record.emotion} onChange={(value) => setRecord((current) => ({ ...current, emotion: value }))} />
          <SliderInput label="辅助程度" value={record.support} onChange={(value) => setRecord((current) => ({ ...current, support: value }))} />
        </div>
        {status ? <p className="inline-alert">{status}</p> : null}
        <button className="primary-button" type="button" onClick={submit} disabled={loading}>
          {loading ? "正在整理记录..." : "保存并生成 AI 复盘"}
          <Check size={18} />
        </button>
      </section>

      {structured?.error ? <p className="inline-alert">{structured.error}</p> : null}
      {structured && !structured.error ? <StructuredRecord record={structured} source={source} /> : null}

      <section className="card">
        <SectionTitle title="最近记录" action={`${records.length} 条`} />
        <div className="record-list">
          {records.slice(0, 4).map((item) => (
            <article key={item.id}>
              <strong>{item.date} · {item.target}</strong>
              <p>{item.reaction}</p>
            </article>
          ))}
          {!records.length ? <p className="muted">还没有记录。保存后会出现在这里。</p> : null}
        </div>
      </section>
    </div>
  );
}

function SliderInput({ label, value, onChange }) {
  return (
    <label className="slider-field">
      <span>{label}</span>
      <input type="range" min="1" max="5" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <strong>{value}</strong>
    </label>
  );
}

function StructuredRecord({ record, source }) {
  return (
    <section className="card success-card">
      <SectionTitle title="AI 结构化整理" action={`评分 ${record.score}`} />
      <div className="structure-grid">
        <article><strong>触发点</strong><p>{record.trigger}</p></article>
        <article><strong>干预方式</strong><p>{record.intervention}</p></article>
        <article><strong>孩子反应</strong><p>{record.reaction}</p></article>
        <article><strong>下次调整</strong><p>{record.next}</p></article>
        <article><strong>下次指标</strong><p>{record.metric}</p></article>
      </div>
      {record.encouragement ? <p className="record-encouragement">{record.encouragement}</p> : null}
      {source ? <span className="source-chip">{source}</span> : null}
    </section>
  );
}

function ArticlesScreen() {
  const [tag, setTag] = useState("全部");
  const [saved, setSaved] = useStoredState("care.savedArticles", []);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const visible = tag === "全部" ? articles : articles.filter((article) => article.tag === tag);

  function toggle(id) {
    setSaved((current) => (current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]));
  }

  if (selectedArticle) {
    return (
      <article className="article-detail">
        <button className="article-back" type="button" onClick={() => setSelectedArticle(null)}>
          <ArrowLeft size={18} />
          返回文章列表
        </button>
        <span className="article-tag">{selectedArticle.tag} · {selectedArticle.readingTime}</span>
        <h2>{selectedArticle.title}</h2>
        <p className="article-lead">{selectedArticle.desc}</p>
        <section className="article-takeaway">
          <strong>核心要点</strong>
          <p>{selectedArticle.takeaway}</p>
        </section>
        <div className="article-body">
          {selectedArticle.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="article-source">资料说明：{selectedArticle.source}</p>
        <button className="ghost-button article-save" type="button" onClick={() => toggle(selectedArticle.id)}>
          <Bookmark size={17} />
          {saved.includes(selectedArticle.id) ? "取消收藏" : "收藏文章"}
        </button>
      </article>
    );
  }

  return (
    <div className="stack">
      <section className="card">
        <SectionTitle title="精品好文" action="先沉淀，再推荐" />
        <div className="tag-row">
          {articleTags.map((item) => (
            <button className={tag === item ? "active" : ""} type="button" key={item} onClick={() => setTag(item)}>
              {item}
            </button>
          ))}
        </div>
      </section>
      <div className="article-list">
        {visible.map((article) => (
          <article className="article-card" key={article.id}>
            <span>{article.tag}</span>
            <h3>{article.title}</h3>
            <p>{article.desc}</p>
            <div className="article-actions">
              <button type="button" onClick={() => setSelectedArticle(article)}>阅读全文</button>
              <button type="button" onClick={() => toggle(article.id)}>
                {saved.includes(article.id) ? "已收藏" : "收藏"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function EmotionScreen({ profile }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useStoredState("care.emotionMessages", [
    { role: "assistant", content: `你可以把今天最难的部分放在这里。我会先陪你，不急着给建议。` },
  ]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");

  async function send() {
    const text = input.trim();
    if (!text) return;
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setStatus("");

    if (shouldUseLocalExperience()) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: `我听到了。你今天已经在很难的情况下继续照顾${profile.nickname}，现在不用急着证明自己做得够不够好。此刻最压着你的，是疲惫、委屈，还是没人理解？`,
        },
      ]);
      setSource("本地体验版");
      setStatus("当前环境没有后端 API，部署到 Vercel 后会调用 DeepSeek。");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiPath("/api/emotion"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, messages: nextMessages }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(formatApiError(payload));
      }
      setMessages([...nextMessages, { role: "assistant", content: payload.reply }].slice(-20));
      setSource(payload.provider ? `${payload.provider} · ${payload.model || "模型"}` : "AI 模型");
    } catch (error) {
      setStatus(`模型调用失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function resetConversation() {
    setMessages([{ role: "assistant", content: "你可以从此刻最难受的部分重新说起。我会先听你说。" }]);
    setInput("");
    setStatus("");
    setSource("");
  }

  return (
    <div className="stack deepqa-screen">
      <section className="card reassure">
        <HeartHandshake size={28} />
        <div>
          <h2>情绪垃圾桶</h2>
          <p>这里先接住你，不评价、不催促、不急着指导。</p>
        </div>
        <button className="ghost-button" type="button" onClick={resetConversation}>清空</button>
      </section>
      {status ? <p className="inline-alert">{status}</p> : null}
      <section className="chat-card">
        {messages.map((message, index) => (
          <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
            {message.content}
          </div>
        ))}
        {loading ? <div className="message assistant">正在认真听你说...</div> : null}
      </section>
      {source ? <span className="source-chip chat-source">{source}</span> : null}
      <div className="chat-input">
        <input
          value={input}
          placeholder="今天最难受的是什么..."
          disabled={loading}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && !loading && send()}
        />
        <button type="button" onClick={send} aria-label="发送" disabled={loading || !input.trim()}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

function AnalysisScreen({ records, reports }) {
  const avgScore = records.length ? Math.round(records.reduce((sum, item) => sum + item.score, 0) / records.length) : 0;
  const recentRecords = records.slice(0, 7).reverse();
  const targetCounts = records.reduce((counts, record) => {
    counts[record.target] = (counts[record.target] || 0) + 1;
    return counts;
  }, {});
  const topTargets = Object.entries(targetCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="stack">
      <section className="dashboard-grid">
        <MetricCard label="干预记录" value={`${records.length} 条`} />
        <MetricCard label="平均评分" value={records.length ? `${avgScore}` : "-"} />
        <MetricCard label="方案报告" value={`${reports.length} 份`} />
      </section>
      <section className="card">
        <SectionTitle title="最近状态趋势" action="近 7 条记录" />
        {recentRecords.length ? (
          <div className="trend-list">
            {recentRecords.map((record) => (
              <article key={record.id}>
                <span>{record.date}</span>
                <div><i style={{ width: `${Math.max(6, record.score)}%` }} /></div>
                <strong>{record.score}</strong>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">记录后会在这里看到最近状态变化。</p>
        )}
      </section>
      <section className="card">
        <SectionTitle title="练习目标分布" action="用于调整投入重点" />
        {topTargets.length ? (
          <div className="target-list">
            {topTargets.map(([target, count]) => (
              <article key={target}>
                <strong>{target}</strong>
                <span>{count} 次</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">连续记录后会自动汇总练习目标。</p>
        )}
      </section>
      <section className="card">
        <SectionTitle title="有效方法排行" action="来自干预记录" />
        {records.length ? (
          <div className="record-list">
            {records.slice(0, 4).map((record) => (
              <article key={record.id}>
                <strong>{record.target}</strong>
                <p>{record.intervention}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">还没有足够记录。建议先连续记录 3 天。</p>
        )}
      </section>
      <section className="card">
        <SectionTitle title="最近方案" action="可继续执行" />
        {reports.length ? (
          <div className="record-list">
            {reports.slice(0, 3).map((report) => (
              <article key={report.id}>
                <strong>{report.form.concern}</strong>
                <p>{report.analysis.summary.priority}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">还没有生成方案。可以先从“方案输出”开始。</p>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function ProfileScreen({ profile, onSave, onReset }) {
  const [draft, setDraft] = useState(profile);
  const [status, setStatus] = useState("");

  function save() {
    if (!draft.nickname.trim() || !draft.age.trim() || !draft.goal.trim()) {
      setStatus("请至少保留孩子昵称、年龄和当前目标。");
      return;
    }
    onSave({
      ...draft,
      nickname: draft.nickname.trim(),
      age: draft.age.trim(),
      goal: draft.goal.trim(),
    });
    setStatus("档案已保存，后续 AI 建议会使用最新信息。");
  }

  return (
    <div className="stack">
      <section className="card">
        <SectionTitle title="孩子档案" action="可随时更新" />
        <div className="form-stack">
          <TextInput label="昵称" value={draft.nickname} onChange={(value) => setDraft((current) => ({ ...current, nickname: value }))} />
          <div className="two-col">
            <TextInput label="年龄" value={draft.age} onChange={(value) => setDraft((current) => ({ ...current, age: value }))} />
            <SelectInput label="性别" value={draft.gender} options={["男", "女", "暂不填写"]} onChange={(value) => setDraft((current) => ({ ...current, gender: value }))} />
          </div>
          <SelectInput
            label="语言能力"
            value={draft.language}
            options={["不会说话", "单词/短句", "能表达需求", "能简单对话", "会说但社交沟通困难"]}
            onChange={(value) => setDraft((current) => ({ ...current, language: value }))}
          />
          <SelectInput
            label="安全风险"
            value={draft.risk}
            options={["无明显安全风险", "有自伤", "有攻击他人", "会冲跑/走失", "严重睡眠或饮食问题"]}
            onChange={(value) => setDraft((current) => ({ ...current, risk: value }))}
          />
          <TextAreaInput label="预期目标" value={draft.goal} onChange={(value) => setDraft((current) => ({ ...current, goal: value }))} />
        </div>
        {status ? <p className="inline-alert">{status}</p> : null}
        <button className="primary-button" type="button" onClick={save}>
          保存档案
          <Check size={18} />
        </button>
      </section>
      <section className="privacy-card-app">
        <LockKeyhole size={22} />
        <p>当前版本数据保存在本地浏览器。后续接入账号系统后，再做云端同步和权限控制。</p>
      </section>
      <button className="ghost-button" type="button" onClick={onReset}>重新体验注册流程</button>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <section className="empty-state">
      <Sparkles size={30} />
      <p>{text}</p>
    </section>
  );
}

export function App() {
  const [profile, setProfile] = useStoredState("care.childProfile", null);
  const [records, setRecords] = useStoredState("care.records", []);
  const [reports, setReports] = useStoredState("care.reports", []);
  const [route, setRoute] = useState(profile ? "home" : "register");

  const pageMeta = useMemo(() => {
    const meta = {
      home: ["安心向导", "让居家干预不迷茫", false],
      solution: ["方案输出", "综合答案 + 各流派解释 + 7 日计划", true],
      deepqa: ["深度问答", "选择不同流派老师深入追问", true],
      record: ["干预记录", "把每天做过的努力结构化", route !== "record"],
      articles: ["精品好文", "筛选适合当前阶段的资料", true],
      emotion: ["情绪垃圾桶", "先接住家长，再谈方法", true],
      analysis: ["趋势分析", "看见变化和有效方法", route !== "analysis"],
      profile: ["孩子档案", "逐步完善孩子上下文", route !== "profile"],
    };
    return meta[route] || meta.home;
  }, [route]);

  if (!profile || route === "register") {
    return (
      <Registration
        onSave={(nextProfile) => {
          setProfile(nextProfile);
          setRoute("home");
        }}
      />
    );
  }

  const [title, subtitle, showBack] = pageMeta;

  function saveRecord(record) {
    setRecords((current) => [record, ...current].slice(0, 30));
  }

  function saveReport(report) {
    setReports((current) => [report, ...current.filter((item) => item.id !== report.id)].slice(0, 12));
  }

  function resetProfile() {
    window.localStorage.removeItem("care.childProfile");
    setProfile(null);
    setRoute("register");
  }

  return (
    <AppShell route={route} setRoute={setRoute} profile={profile} title={title} subtitle={subtitle} showBack={showBack}>
      {route === "home" ? <HomeScreen profile={profile} setRoute={setRoute} records={records} reports={reports} /> : null}
      {route === "solution" ? <SolutionScreen profile={profile} records={records} onSaveReport={saveReport} /> : null}
      {route === "deepqa" ? <DeepQaScreen profile={profile} records={records} /> : null}
      {route === "record" ? <RecordScreen profile={profile} records={records} onSaveRecord={saveRecord} /> : null}
      {route === "articles" ? <ArticlesScreen /> : null}
      {route === "emotion" ? <EmotionScreen profile={profile} /> : null}
      {route === "analysis" ? <AnalysisScreen records={records} reports={reports} /> : null}
      {route === "profile" ? <ProfileScreen profile={profile} onSave={setProfile} onReset={resetProfile} /> : null}
    </AppShell>
  );
}
