import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  Check,
  ChevronDown,
  ClipboardPen,
  FileText,
  HeartHandshake,
  HelpCircle,
  Lightbulb,
  LockKeyhole,
  MessageCircle,
  PanelRightOpen,
  PencilLine,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const initialForm = {
  age: "请选择年龄",
  concern: "",
  scene: "请选择主要场景",
  severity: "中等",
  tried: "",
};

const ageOptions = ["请选择年龄", "2-3 岁", "4-5 岁", "6 岁 3 个月", "7-9 岁", "10 岁以上"];
const sceneOptions = [
  "请选择主要场景",
  "幼儿园入园、早晨送园",
  "家庭日常转换",
  "同伴互动",
  "课堂/集体活动",
  "公共场所",
  "睡眠/饮食/如厕",
];
const severityOptions = ["轻微", "中等", "较强", "严重"];

const issueRules = [
  {
    id: "transition",
    name: "转换与分离困难",
    keywords: ["入园", "分离", "过渡", "转换", "离开", "早晨", "上学", "变化"],
  },
  {
    id: "emotion",
    name: "情绪崩溃与调节困难",
    keywords: ["哭", "崩溃", "大叫", "发脾气", "攻击", "自伤", "情绪", "失控"],
  },
  {
    id: "social",
    name: "社交参与不足",
    keywords: ["互动", "同伴", "老师", "社交", "不理人", "眼神", "集体"],
  },
  {
    id: "communication",
    name: "沟通理解不足",
    keywords: ["表达", "听不懂", "指令", "语言", "不会说", "重复", "问答"],
  },
  {
    id: "sensory",
    name: "感官或环境压力",
    keywords: ["声音", "人声", "广播", "噪音", "吵", "尖叫", "捂耳朵", "光", "触觉", "衣服", "拥挤", "味道", "感官"],
  },
  {
    id: "routine",
    name: "规则与可预测性不足",
    keywords: ["规则", "流程", "排队", "等待", "轮流", "突然", "不知道"],
  },
];

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const skillVisuals = {
  "zou-xiaobing-bsr": {
    icon: Users,
    tone: "green",
  },
  "guo-yanqing-aba-core": {
    icon: MessageCircle,
    tone: "amber",
  },
  "gutstein-rdi": {
    icon: HeartHandshake,
    tone: "blue",
  },
  "winner-social-thinking": {
    icon: PanelRightOpen,
    tone: "violet",
  },
  "greenspan-dir-floortime": {
    icon: Sparkles,
    tone: "teal",
  },
};

const supportCards = [
  {
    title: "综合建议",
    text: "整合五大视角，给出重点方向与优先建议。",
    icon: FileText,
    tone: "green",
  },
  {
    title: "家庭干预计划",
    text: "分阶段目标与具体做法，便于在家执行与调整。",
    icon: ClipboardPen,
    tone: "orange",
  },
  {
    title: "进展记录与调整",
    text: "记录变化，定期回顾，优化支持策略。",
    icon: BarChart3,
    tone: "blue",
  },
];

function detectTags(form) {
  const text = `${form.concern} ${form.scene} ${form.tried}`.toLowerCase();
  return issueRules.reduce((result, rule) => {
    result[rule.id] = rule.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
    return result;
  }, {});
}

function detectedNames(tags) {
  return issueRules.filter((rule) => tags[rule.id]).map((rule) => rule.name);
}

function buildDraftInsight(form) {
  const tags = detectTags(form);
  const names = detectedNames(tags);

  return {
    names: names.length ? names : ["需要更多具体情境"],
  };
}

function apiPath(path) {
  return `${apiBaseUrl}${path}`;
}

function isGithubPagesWithoutApi() {
  return !apiBaseUrl && window.location.hostname.endsWith("github.io");
}

function normalizeList(items) {
  return Array.isArray(items) ? items.filter(Boolean) : [];
}

function normalizeAiAnalysis(analysis) {
  return {
    names: normalizeList(analysis?.names),
    skills: normalizeList(analysis?.skills).map((skill) => {
      const visual = skillVisuals[skill.id] || {};
      return {
        ...skill,
        icon: visual.icon || HelpCircle,
        tone: visual.tone || "green",
        result: {
          reasons: normalizeList(skill.result?.reasons),
          principles: normalizeList(skill.result?.principles),
          actions: normalizeList(skill.result?.actions),
          weekPlan: skill.result?.weekPlan || "未来 7 天选择一个小目标持续记录和调整。",
        },
      };
    }),
    summary: {
      priority: analysis?.summary?.priority || "先降低压力，再选择一个可观察的小目标练习。",
      firstStep: analysis?.summary?.firstStep || "今天先记录一次完整情境：前因、行为、后果和恢复方式。",
      warning:
        analysis?.summary?.warning ||
        "如果出现自伤、攻击、退行、睡眠饮食急剧恶化或无法保证安全，应尽快联系专业人员。",
    },
  };
}

function formatApiError(payload) {
  const parts = [payload?.error || "后端模型调用失败，请稍后重试。"];

  if (payload?.providerStatus) {
    parts.push(`平台状态码：${payload.providerStatus}`);
  }

  if (payload?.detail) {
    parts.push(`细节：${payload.detail}`);
  }

  return parts.join(" ");
}

function MiniLogo() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <HeartHandshake size={28} strokeWidth={1.8} />
      <span />
    </div>
  );
}

function FieldLabel({ icon: Icon, title, hint }) {
  return (
    <label className="field-label">
      <Icon size={18} strokeWidth={1.9} />
      <span>{title}</span>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function ResultList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function LensRow({ skill }) {
  const Icon = skill.icon;
  const result = skill.result;

  return (
    <section className={`lens-row ${skill.tone}`}>
      <div className="lens-name">
        <div className="lens-icon">
          <Icon size={30} strokeWidth={1.85} />
        </div>
        <strong>{skill.name}</strong>
        <span>{skill.label}</span>
      </div>
      <div className="lens-column">
        <h3>可能原因</h3>
        <ResultList items={result.reasons} />
      </div>
      <div className="lens-column">
        <h3>处理原则</h3>
        <ResultList items={result.principles} />
      </div>
      <div className="lens-column">
        <h3>家长可做</h3>
        <ResultList items={result.actions} />
      </div>
      <div className="lens-plan">
        <strong>核心逻辑</strong>
        <p>{skill.core}</p>
        <strong>7 天重点</strong>
        <p>{result.weekPlan}</p>
      </div>
    </section>
  );
}

function SelectField({ value, options, onChange }) {
  return (
    <div className="select-wrap">
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={18} />
    </div>
  );
}

function EmptyReport() {
  return (
    <section className="empty-report">
      <Sparkles size={38} />
      <h2>还没有生成本次专家报告</h2>
      <p>在左侧输入孩子当前问题后，点击“生成/更新专家报告”。报告会在这里显示，并且只基于本次输入。</p>
    </section>
  );
}

export function App() {
  const [form, setForm] = useState(initialForm);
  const [report, setReport] = useState(null);
  const [formError, setFormError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef(null);

  const draftAnalysis = useMemo(() => buildDraftInsight(form), [form]);
  const completed = report ? 3 : form.concern.trim() ? 1 : 0;

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setReport(null);
    setFormError("");
  }

  async function generateReport() {
    const nextForm = {
      ...form,
      concern: form.concern.trim(),
      tried: form.tried.trim(),
    };

    if (!nextForm.concern) {
      setFormError("请先写下孩子当前最困扰你的具体表现，再生成专家报告。");
      setReport(null);
      return;
    }

    if (isGithubPagesWithoutApi()) {
      setFormError("当前 GitHub Pages 是纯静态页面，还没有后端模型地址。请部署 Vercel 后端，或配置 VITE_API_BASE_URL 指向后端 API。");
      setReport(null);
      return;
    }

    setForm(nextForm);
    setFormError("");
    setIsGenerating(true);

    try {
      const response = await fetch(apiPath("/api/analyze"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ form: nextForm }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(formatApiError(payload));
      }

      setReport({
        form: nextForm,
        analysis: normalizeAiAnalysis(payload.analysis),
        generatedAt: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        model: payload.model,
      });
      window.setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    } catch (error) {
      setReport(null);
      setFormError(error.message || "后端模型调用失败，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <MiniLogo />
          <div>
            <h1>安心向导</h1>
            <p>陪伴成长 · 看见希望</p>
          </div>
        </div>
        <nav className="top-actions" aria-label="辅助导航">
          <button type="button">
            <BookOpen size={21} />
            使用指南
          </button>
          <button type="button">
            <HelpCircle size={21} />
            常见问题
          </button>
          <button type="button" className="profile-chip">
            <span>家</span>
            家长
            <ChevronDown size={17} />
          </button>
        </nav>
      </header>

      <div className="workspace">
        <aside className="intake-panel">
          <div className="step-title">
            <span>1</span>
            <div>
              <h2>输入孩子当前问题</h2>
              <p>提交后会生成一份绑定本次输入的专家报告，不再沿用示例问题。</p>
            </div>
          </div>

          <form className="intake-form" onSubmit={(event) => event.preventDefault()}>
            <div className="form-group">
              <FieldLabel icon={Users} title="年龄" />
              <SelectField
                value={form.age}
                options={ageOptions}
                onChange={(value) => updateForm("age", value)}
              />
              <small>年龄会影响目标难度和家庭练习方式</small>
            </div>

            <div className="form-group">
              <FieldLabel icon={MessageCircle} title="当前问题" hint="直接写最困扰你的表现" />
              <textarea
                value={form.concern}
                maxLength={300}
                placeholder="例如：孩子在商场听到广播和人声会捂耳朵尖叫，推开家长，不肯排队等待。"
                onChange={(event) => updateForm("concern", event.target.value)}
              />
              <div className="count-row">{form.concern.length}/300</div>
            </div>

            <div className="form-group">
              <FieldLabel icon={ShieldCheck} title="场景" hint="问题最常发生在哪里" />
              <SelectField
                value={form.scene}
                options={sceneOptions}
                onChange={(value) => updateForm("scene", value)}
              />
              <small>选择场景后，各流派建议会更具体</small>
            </div>

            <div className="form-group">
              <FieldLabel icon={BarChart3} title="强度" hint="困扰的频率与影响程度" />
              <div className="severity-tabs">
                {severityOptions.map((item) => (
                  <button
                    type="button"
                    className={form.severity === item ? "active" : ""}
                    onClick={() => updateForm("severity", item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <small>{form.severity === "严重" ? "优先考虑安全、降压和专业支持" : "可以从一个小目标开始练习"}</small>
            </div>

            <div className="form-group">
              <FieldLabel icon={CalendarCheck} title="已尝试的方法" hint="写有效和无效的做法" />
              <textarea
                value={form.tried}
                maxLength={300}
                placeholder="例如：尝试过讲道理、奖励零食、立刻离开现场。离开后能平静，但下次进入商场还是会发生。"
                onChange={(event) => updateForm("tried", event.target.value)}
              />
              <div className="count-row">{form.tried.length}/300</div>
            </div>
          </form>

          <div className="tip-box">
            <Lightbulb size={24} />
            <div>
              <strong>当前识别到</strong>
              <p>{form.concern.trim() ? draftAnalysis.names.join("、") : "等待输入孩子当前问题"}</p>
            </div>
          </div>

          {formError ? <p className="form-error">{formError}</p> : null}

          <button className="primary-action" type="button" onClick={generateReport} disabled={isGenerating}>
            <PencilLine size={21} />
            {isGenerating ? "AI 正在生成..." : "生成/更新专家报告"}
          </button>
        </aside>

        <section className="analysis-panel" ref={reportRef} aria-live="polite">
          <div className="analysis-head">
            <div className="step-title compact">
              <span>2</span>
              <h2>本次专家报告</h2>
            </div>
            <p>每个 skill 按自己的逻辑解释你提交的同一个问题，不互相覆盖。</p>
          </div>

          {report ? (
            <>
              <section className="case-summary">
                <div>
                  <span>分析对象</span>
                  <h3>{report.form.concern}</h3>
                </div>
                <dl>
                  <div>
                    <dt>年龄</dt>
                    <dd>{report.form.age}</dd>
                  </div>
                  <div>
                    <dt>场景</dt>
                    <dd>{report.form.scene}</dd>
                  </div>
                  <div>
                    <dt>强度</dt>
                    <dd>{report.form.severity}</dd>
                  </div>
                  <div>
                    <dt>生成时间</dt>
                    <dd>{report.generatedAt}</dd>
                  </div>
                </dl>
              </section>

              <div className="lens-list">
                {report.analysis.skills.map((skill) => (
                  <LensRow skill={skill} key={skill.id} />
                ))}
              </div>

              <section className="next-step ready">
                <div>
                  <Sparkles size={34} />
                  <div>
                    <h2>综合建议已生成</h2>
                    <p>{report.analysis.summary.priority}</p>
                  </div>
                </div>
                <button type="button" onClick={generateReport} disabled={isGenerating}>
                  {isGenerating ? "生成中" : "重新生成"}
                  <ArrowRight size={19} />
                </button>
              </section>

              <section className="integrated-card">
                <h2>综合流派专家建议</h2>
                <div className="integrated-grid">
                  <article>
                    <h3>优先方向</h3>
                    <p>{report.analysis.summary.priority}</p>
                  </article>
                  <article>
                    <h3>第一步</h3>
                    <p>{report.analysis.summary.firstStep}</p>
                  </article>
                  <article>
                    <h3>安全提醒</h3>
                    <p>{report.analysis.summary.warning}</p>
                  </article>
                </div>
              </section>
            </>
          ) : (
            <EmptyReport />
          )}
        </section>

        <aside className="support-panel">
          <div className="step-title compact">
            <span>3</span>
            <h2>支持进度与下一步</h2>
          </div>

          <section className="progress-card">
            <h3>当前进度</h3>
            <div className="progress-layout">
              <div className="progress-ring" style={{ "--progress": `${completed / 3}` }}>
                <strong>{completed}/3</strong>
                <span>完成度</span>
              </div>
              <ul>
                <li className={form.concern.trim() ? "done" : ""}>
                  {form.concern.trim() ? <Check size={16} /> : <span className="empty-dot" />}
                  输入孩子情况
                </li>
                <li className={report ? "done" : ""}>
                  {report ? <Check size={16} /> : <span className="empty-dot" />}
                  生成多视角分析
                </li>
                <li className={report ? "done" : ""}>
                  {report ? <Check size={16} /> : <span className="empty-dot" />}
                  综合建议生成
                </li>
              </ul>
            </div>
          </section>

          <section className="support-stack">
            <h3>本页真正可交互</h3>
            {supportCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className={`support-card ${card.tone}`} key={card.title}>
                  <Icon size={32} strokeWidth={1.8} />
                  <div>
                    <h4>{card.title}</h4>
                    <p>{card.text}</p>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="reassure-card">
            <HeartHandshake size={34} />
            <div>
              <h3>你并不孤单</h3>
              <p>每一点理解与尝试，都是孩子成长路上重要的支持。</p>
            </div>
          </section>

          <section className="privacy-card">
            <LockKeyhole size={25} />
            <div>
              <h3>边界说明</h3>
              <p>这是家庭实践辅助工具，不冒充专家本人，也不替代诊疗、评估或个训方案。</p>
            </div>
          </section>
        </aside>
      </div>

      <footer className="medical-note">
        基于公开流派原则的家庭实践参考，不替代专业诊疗；紧急安全风险请及时就医或求助。
      </footer>
    </main>
  );
}
