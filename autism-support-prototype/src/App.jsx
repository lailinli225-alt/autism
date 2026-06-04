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

const expertSkills = [
  {
    id: "zou",
    name: "邹小兵",
    label: "BSR/结构化社交行为视角",
    tone: "green",
    icon: Users,
    core: "先看行为背后的功能与环境，再用结构化、关系和行为支持降低孩子的压力。",
    analyze(form, tags) {
      const where = sceneLabel(form);
      return {
        reasons: [
          pick(tags.transition, `“${where}”里的转换压力超过孩子当前适应能力`, "当前行为可能与环境要求和孩子能力不匹配有关"),
          pick(tags.emotion, "情绪唤醒过高，孩子先失去自我调节能力", "孩子可能不是故意对抗，而是在表达困难"),
          pick(tags.social, "他人、规则和环境刺激同时出现，社交负荷偏高", "自然情境中的社交要求需要被拆小"),
        ],
        principles: [
          "先处理安全感和情绪，再谈规则与要求",
          "区分合理需求和不合理要求，合理需求先被看见",
          `把“${where}”里的要求拆成更小步骤，让孩子每天有成功体验`,
        ],
        actions: [
          `为“${where}”做固定三步流程：进入前预告、完成一个小动作、离开或休息`,
          "哭闹时减少讲道理，先用短句确认情绪：我知道你很难，但我会来接你",
          "把目标从“不哭”改成“少 1 分钟、快 1 步、能完成一个小交接”",
        ],
        weekPlan: "连续 7 天记录触发点、持续时间、恢复方式，只调整一个变量，不同时加很多方法。",
      };
    },
  },
  {
    id: "guo",
    name: "郭延庆",
    label: "机会-练习-强化视角",
    tone: "amber",
    icon: MessageCircle,
    core: "把目标变成孩子能练习的具体行为，通过足够机会、辅助和强化，让能力在真实场景中泛化。",
    analyze(form, tags) {
      const where = sceneLabel(form);
      return {
        reasons: [
          pick(tags.communication, `孩子可能没有真正理解“${where}”里接下来会发生什么`, "孩子需要把抽象要求转成可理解的行为"),
          pick(tags.routine, "缺少可反复练习的固定行为链", "当前问题需要被拆成可训练的小目标"),
          pick(tags.emotion, "奖励贴纸短期有效，说明强化有价值但目标可能太大", "已有方法有效但强度和时机需要重新设计"),
        ],
        principles: [
          "先设一个可以观察的目标行为，而不是笼统要求孩子配合",
          "给机会、给辅助、及时强化，逐步撤辅助",
          `在家、路上、“${where}”用同一套动作练习泛化`,
        ],
        actions: [
          `目标行为先定为：在“${where}”完成一个可观察动作，哪怕情绪仍然存在`,
          "每天在家模拟 3 次“进入场景-完成一步-得到休息”的短流程",
          "强化要贴近行为发生后 10 秒内出现，强化孩子完成的具体动作",
        ],
        weekPlan: "第 1-2 天练流程，第 3-5 天缩短提示，第 6-7 天换地点练同一行为。",
      };
    },
  },
  {
    id: "rdi",
    name: "Steven Gutstein / RDI",
    label: "关系发展视角",
    tone: "blue",
    icon: HeartHandshake,
    core: "重点不是让孩子机械服从，而是让家长成为稳定引导者，帮助孩子在变化中建立共同调节和动态思考。",
    analyze(form, tags) {
      const where = sceneLabel(form);
      return {
        reasons: [
          pick(tags.transition, "变化来得太快，孩子缺少与成人共同应对变化的经验", "孩子需要在关系中学习处理不确定"),
          pick(tags.social, `“${where}”里的互动更像任务要求，而不是可依靠的共同经验`, "关系动机需要在低压力互动中恢复"),
          pick(tags.emotion, "情绪升高后，孩子难以跟随成人的引导", "共同调节能力需要提前练，而不是崩溃后才练"),
        ],
        principles: [
          "家长少问、多分享，用平静节奏做引导者",
          "先建立共同注意和共同行动，再加入变化",
          "用可预测框架承载一点点不确定，让孩子练习弹性",
        ],
        actions: [
          "每天 10 分钟做一个孩子喜欢的双人活动，家长只加一个小变化",
          `进入“${where}”前不连续追问“怕不怕”，改为分享式语言：我看到这里有点难，我们慢慢来`,
          "固定一个共同动作，但每天让孩子选择一个小元素：先牵手还是先看图卡",
        ],
        weekPlan: "用 7 天建立“共同走流程”的经验，每次只改变一个很小的环节。",
      };
    },
  },
  {
    id: "social-thinking",
    name: "Michelle Garcia Winner",
    label: "社交思维视角",
    tone: "violet",
    icon: PanelRightOpen,
    core: "帮助孩子理解情境、他人想法、自己的行为会带来的影响，再把社交期待变成可视化线索。",
    analyze(form, tags) {
      const where = sceneLabel(form);
      return {
        reasons: [
          pick(tags.social, `孩子可能不理解“${where}”中他人会怎么想、怎么期待`, "孩子需要更清楚地看见社交情境"),
          pick(tags.communication, "语言预告可能太抽象，没转化成孩子能用的社交线索", "需要把语言变成图像、动作和情境演练"),
          pick(tags.routine, "孩子难以预测下一步，导致对情境的理解断裂", "社交规则需要显性化，而不是默认孩子能推断"),
        ],
        principles: [
          "把场景中的人、想法、期待和下一步说清楚",
          "用图卡/简图帮助孩子理解“我走后会发生什么”",
          "演练时关注行为效果，而不是评价孩子好坏",
        ],
        actions: [
          `画一张“${where}”社交地图：家长想法、旁人想法、孩子可以做的 2 个动作`,
          "用一句社交脚本替代长解释：这里有点难，我可以先做一步，再休息",
          "回家后复盘一个成功点：你刚才完成了哪一步，别人因此更容易帮助你",
        ],
        weekPlan: "每天只练一个社交线索：看提示、说需求、等待、完成一步、请求休息。",
      };
    },
  },
  {
    id: "dir",
    name: "Stanley Greenspan / DIR",
    label: "DIR/Floortime 发展视角",
    tone: "teal",
    icon: Sparkles,
    core: "从孩子的发展阶段、个体差异和关系情感出发，通过跟随兴趣与情绪调节提升参与能力。",
    analyze(form, tags) {
      const where = sceneLabel(form);
      return {
        reasons: [
          pick(tags.sensory, "环境刺激可能让孩子的身体先进入防御状态", "孩子的个体感官差异需要被纳入计划"),
          pick(tags.emotion, "情绪调节能力还不足以承受高压力分离", "需要先支持自我调节，再提升参与要求"),
          pick(tags.transition, "发展阶段上的转换能力还需要从低挑战开始搭建", "孩子需要在安全关系中逐步扩大挑战"),
        ],
        principles: [
          "先跟随孩子状态，找到可进入互动的窗口",
          `调节感官和情绪负荷，再增加“${where}”里的参与要求`,
          "用情感联结推动参与，而不是只靠指令推动",
        ],
        actions: [
          `进入“${where}”前 5 分钟安排稳定身体的活动：深压抱、慢走、背包任务或推墙`,
          "用孩子喜欢的主题做告别游戏，让告别从命令变成互动",
          `如果环境太吵，提前进入“${where}”或错峰进入，降低感官负荷`,
        ],
        weekPlan: "每天观察孩子最容易进入互动的时间、活动和感官状态，把它放到高压力场景前。",
      };
    },
  },
];

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

function pick(condition, hit, fallback) {
  return condition ? hit : fallback;
}

function sceneLabel(form) {
  return form.scene === "请选择主要场景" ? "这个场景" : form.scene;
}

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

function buildAnalysis(form) {
  const tags = detectTags(form);
  const names = detectedNames(tags);
  const where = sceneLabel(form);
  const skills = expertSkills.map((skill) => ({
    ...skill,
    result: skill.analyze(form, tags),
  }));

  return {
    tags,
    names: names.length ? names : ["需要更多具体情境"],
    skills,
    summary: {
      priority:
        form.severity === "严重"
          ? `先降低“${where}”里的压力和情绪强度，再训练一个具体可完成的行为`
          : "先明确一个小目标，稳定练习并观察变化",
      firstStep: `未来 7 天只追踪一个核心指标：从进入“${where}”到孩子恢复平静的时间。`,
      warning:
        "如果出现明显自伤、攻击、退行、睡眠饮食急剧恶化或家长无法保证安全，应尽快联系儿童发育行为/精神心理专业人员。",
    },
  };
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
  const reportRef = useRef(null);

  const draftAnalysis = useMemo(() => buildAnalysis(form), [form]);
  const completed = report ? 3 : form.concern.trim() ? 1 : 0;

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setReport(null);
    setFormError("");
  }

  function generateReport() {
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

    setForm(nextForm);
    setReport({
      form: nextForm,
      analysis: buildAnalysis(nextForm),
      generatedAt: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    setFormError("");
    window.setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
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

          <button className="primary-action" type="button" onClick={generateReport}>
            <PencilLine size={21} />
            生成/更新专家报告
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
                <button type="button" onClick={generateReport}>
                  重新生成
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
