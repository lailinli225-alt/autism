import { useMemo, useState } from "react";
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

const lensRows = [
  {
    name: "邹小兵",
    label: "理论视角",
    tone: "green",
    icon: Users,
    reasons: ["适应转换的道路受阻", "压力唤醒高，安全感不足", "学校环境对其要求过高"],
    principles: ["先安顿情绪，再解决问题", "降低要求，提升成功体验", "建立稳定的联结与信任"],
    actions: ["先连接再引导，回应情绪", "提供可预测的过渡支持", "关注微小进步，及时强化"],
  },
  {
    name: "郭延庆",
    label: "核心信息视角",
    tone: "amber",
    icon: MessageCircle,
    reasons: ["核心信息理解与表达弱", "难以理解分离背后的意义", "信息处理速度较慢"],
    principles: ["清晰、简洁、结构化表达", "帮助理解事件的意图与预期", "用视觉化支持理解与记忆"],
    actions: ["社会小故事/视觉日程表", "关键词和图片提示", "反复预告与回顾"],
  },
  {
    name: "RDI",
    label: "关系发展视角",
    tone: "blue",
    icon: HeartHandshake,
    reasons: ["互动意愿能量发展不足", "关系动机弱，合作性低", "情绪调节需支持"],
    principles: ["建立关系动机，创造连接", "跟随孩子兴趣，双向互动", "灵活调整，循序渐进"],
    actions: ["每天高质量互动时段", "关注并扩展孩子的兴趣", "在互动中自然引导分离"],
  },
  {
    name: "社交思维",
    label: "视角",
    tone: "violet",
    icon: PanelRightOpen,
    reasons: ["难以理解他人想法与感受", "对入园情境缺乏认知", "思维僵化，变化带来压力"],
    principles: ["明确情境与期望", "可视化规则与社交线索", "练习与泛化到真实情境"],
    actions: ["社交思维故事", "思维地图/情境演练", "识别情绪与他人想法"],
  },
  {
    name: "DIR/Floortime",
    label: "发展视角",
    tone: "teal",
    icon: Sparkles,
    reasons: ["发育功能阶段性差异", "感官与情绪调节挑战", "自我调节与统合需支持"],
    principles: ["跟随孩子，赋能发展", "情感联结促进发育", "支持自我调节与参与"],
    actions: ["地板时光互动游戏", "感官支持与环境调整", "渐进提升参与挑战"],
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

function LensRow({ row }) {
  const Icon = row.icon;

  return (
    <section className={`lens-row ${row.tone}`}>
      <div className="lens-name">
        <div className="lens-icon">
          <Icon size={30} strokeWidth={1.85} />
        </div>
        <strong>{row.name}</strong>
        <span>{row.label}</span>
      </div>
      <div className="lens-column">
        <h3>可能原因</h3>
        <ul>
          {row.reasons.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="lens-column">
        <h3>处理原则</h3>
        <ul>
          {row.principles.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="lens-column">
        <h3>家庭可执行干预</h3>
        <ul>
          {row.actions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function App() {
  const [severity, setSeverity] = useState("严重");
  const [generated, setGenerated] = useState(false);

  const completed = useMemo(() => (generated ? 3 : 2), [generated]);

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
              <h2>先告诉我们孩子的情况</h2>
              <p>填写越具体，分析越贴合实际。所有内容仅用于理解与建议生成。</p>
            </div>
          </div>

          <form className="intake-form">
            <div className="form-group">
              <FieldLabel icon={Users} title="年龄" />
              <div className="select-like">
                6 岁 3 个月
                <ChevronDown size={18} />
              </div>
              <small>可填写：按月更准确</small>
            </div>

            <div className="form-group">
              <FieldLabel icon={MessageCircle} title="当前困扰" hint="尽量具体描述" />
              <textarea
                defaultValue="在幼儿园入园过渡时情绪崩溃，哭闹大叫，不愿和老师同伴互动，分离困难严重。"
                maxLength={200}
              />
              <div className="count-row">32/200</div>
            </div>

            <div className="form-group">
              <FieldLabel icon={ShieldCheck} title="场景" hint="发生在什么时侯 / 什么地方" />
              <div className="select-like">
                幼儿园入园、早晨送园
                <ChevronDown size={18} />
              </div>
              <small>可多选</small>
            </div>

            <div className="form-group">
              <FieldLabel icon={BarChart3} title="强度" hint="困扰的频率与程度" />
              <div className="severity-tabs">
                {["轻微", "中等", "较强", "严重"].map((item) => (
                  <button
                    type="button"
                    className={severity === item ? "active" : ""}
                    onClick={() => setSeverity(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <small>几乎每天出现，强烈影响日常</small>
            </div>

            <div className="form-group">
              <FieldLabel icon={CalendarCheck} title="已尝试的方法" hint="对孩子有帮助的或没效果的" />
              <textarea
                defaultValue="提前告诉入园时间、带喜欢的玩具、缩短分离时间、奖励贴纸、绘本引导。短期有效，但持续时间很短，哭闹仍反复。"
                maxLength={200}
              />
              <div className="count-row">44/200</div>
            </div>
          </form>

          <div className="tip-box">
            <Lightbulb size={24} />
            <div>
              <strong>小贴士</strong>
              <p>从现象出发，记录具体行为和情绪变化，能帮助我们更好地理解孩子。</p>
            </div>
          </div>

          <button className="primary-action" type="button" onClick={() => setGenerated(true)}>
            <PencilLine size={21} />
            更新并生成分析
          </button>
        </aside>

        <section className="analysis-panel">
          <div className="analysis-head">
            <div className="step-title compact">
              <span>2</span>
              <h2>多视角分析预览</h2>
            </div>
            <p>从不同理论视角理解，找到更合适的支持思路。</p>
          </div>

          <div className="lens-list">
            {lensRows.map((row) => (
              <LensRow row={row} key={row.name} />
            ))}
          </div>

          <section className={`next-step ${generated ? "ready" : ""}`}>
            <div>
              <Sparkles size={34} />
              <div>
                <h2>{generated ? "综合建议已生成" : "下一步：生成综合建议"}</h2>
                <p>整合以上视角，形成个性化、可执行的家庭支持建议。</p>
              </div>
            </div>
            <button type="button" onClick={() => setGenerated(true)}>
              生成综合建议
              <ArrowRight size={19} />
            </button>
          </section>
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
                <li>
                  <Check size={16} />
                  填写孩子情况
                </li>
                <li>
                  <Check size={16} />
                  多视角分析预览
                </li>
                <li className={generated ? "done" : ""}>
                  {generated ? <Check size={16} /> : <span className="empty-dot" />}
                  综合建议生成
                </li>
              </ul>
            </div>
          </section>

          <section className="support-stack">
            <h3>后续你将获得</h3>
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
              <h3>隐私与安全</h3>
              <p>所有内容仅用于生成建议，不会公开孩子的隐私。</p>
            </div>
          </section>
        </aside>
      </div>

      <footer className="medical-note">辅助理解与家庭实践参考，不替代专业诊疗。</footer>
    </main>
  );
}
