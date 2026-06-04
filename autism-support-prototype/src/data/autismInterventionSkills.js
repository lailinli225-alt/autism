export const autismInterventionSkills = [
  {
    id: "zou-xiaobing-bsr",
    version: "0.1.0",
    displayName: "邹小兵 BSR 结构化社交行为视角",
    expertReference: {
      name: "邹小兵",
      affiliation: "中山大学附属第三医院儿童发育行为中心",
      role: "儿童发育行为专家；BSR 模式提出者",
    },
    sourceBasis: [
      "ASD 干预以社交缺陷为核心任务。",
      "坚持科学循证、个性化、家庭和社区为基地。",
      "BSR 将行为管理作为基本方法，结构化教育作为框架，社会交往作为核心内容。",
    ],
    bestFor: [
      "入园、转换、等待、规则适应困难",
      "社交参与少、共同注意弱、互动意愿低",
      "家长需要把干预放进日常生活场景",
    ],
    reasoningSteps: [
      "先识别问题是否来自社交阶梯能力不足、环境要求过高或结构不清。",
      "再判断行为功能：逃避、获得、寻求注意、自我调节或感官压力。",
      "把场景拆成社交元素、社交游戏和可执行小步骤。",
      "优先给家长一个自然情境中的 7 天练习计划。",
    ],
    outputContract: [
      "可能原因：从社交发展、结构化支持和行为功能三层说明。",
      "处理原则：先降低压力，再创造成功经验，最后逐步提高要求。",
      "家庭干预：必须具体到场景、动作、提示、强化和记录指标。",
      "风险提醒：自伤、攻击、退行或安全不可控时转专业评估。",
    ],
    interventionPlaybook: {
      transition: [
        "给固定三步流程：预告、完成一个小动作、得到休息或进入下一步。",
        "把目标从完全不哭改成持续时间减少、恢复更快或完成一个交接动作。",
      ],
      social: [
        "用孩子能成功的社交阶梯作为起点，例如看、靠近、共同做、轮流、回应。",
        "把同伴互动做成短游戏，不直接要求孩子长时间社交。",
      ],
      emotion: [
        "高唤醒时减少讲道理，使用短句确认情绪并降低要求。",
        "记录触发点、持续时间和恢复方式，一周只调整一个变量。",
      ],
      sensory: [
        "调整光线、声音、距离和进入时间，先让孩子身体稳定。",
        "把感官支持作为进入社交行为练习前的准备，而不是奖励或惩罚。",
      ],
    },
    promptTemplate: `
你是“基于邹小兵 BSR 结构化社交行为模式的家庭干预分析 Skill”，不是邹小兵本人。
请基于公开 BSR 原则分析家长输入：{{case}}
输出必须包含：
1. 可能原因：社交能力阶梯、结构化支持、行为功能。
2. 正确处理原则：循证、个性化、家庭自然情境、降低压力。
3. 家庭可执行干预：3-5 个具体动作，包含提示、强化和记录指标。
4. 何时需要专业支持。
避免诊断、保证疗效、责备家长或要求孩子强行压抑。
`,
    sources: [
      {
        title: "邹小兵专家介绍",
        publisher: "中山大学附属第三医院",
        url: "https://www.zssy.com.cn/node/15313",
      },
      {
        title: "孤独症谱系障碍干预原则与 BSR 模式",
        publisher: "中国儿童保健杂志",
        url: "https://cjchc.xjtu.edu.cn/CN/abstract/abstract3332.shtml",
      },
      {
        title: "自闭症儿童社交能力阶梯训练：BSR 模式",
        type: "book",
        url: "https://www.sanmin.com.tw/product/index/015131239",
      },
    ],
  },
  {
    id: "guo-yanqing-aba-core",
    version: "0.1.0",
    displayName: "郭延庆 ABA/核心行为信息视角",
    expertReference: {
      name: "郭延庆",
      affiliation: "北京大学第六医院",
      role: "儿童精神科与行为分析方向专家",
    },
    sourceBasis: [
      "应用行为分析关注可观察行为、行为前因、行为后果和行为功能。",
      "干预应把抽象目标转为可练习、可观察、可强化的行为目标。",
      "泛化需要在真实生活场景中有准备地重复练习。",
    ],
    bestFor: [
      "问题行为管理：哭闹、逃避、攻击、拖延、抢物、等待困难",
      "能力塑造：语言沟通、配合、生活自理、课堂规则",
      "家长不知道如何提要求、给辅助和强化",
    ],
    reasoningSteps: [
      "把家长描述转成 ABC：前因、行为、后果。",
      "判断问题行为的功能：逃避、获得、注意、自动强化或多重功能。",
      "找替代行为：孩子可以用什么更合适的方式达到同一需求。",
      "设计辅助、强化、撤辅助和泛化计划。",
    ],
    outputContract: [
      "可能原因：必须说明行为功能和维持因素。",
      "处理原则：先定义目标行为，再安排机会、辅助和强化。",
      "家庭干预：包含目标行为、替代行为、强化时机、记录表。",
      "避免事项：不把惩罚作为首选，不只讲道理，不频繁换方案。",
    ],
    interventionPlaybook: {
      escape: [
        "把任务拆短，先完成一个最小动作，再立即给休息。",
        "教替代沟通，例如说休息、递卡片、指向安静区。",
      ],
      access: [
        "把想要的物品变成沟通机会，先提示表达，再给具体强化。",
        "从即时强化逐步过渡到延迟等待。",
      ],
      attention: [
        "主动安排高质量关注，减少孩子用问题行为换关注的必要。",
        "强化合适的呼唤、靠近、递物、眼神或声音表达。",
      ],
      generalization: [
        "同一个目标在家、路上、学校或公共场所用同一规则练习。",
        "每次只变一个条件：人、地点、材料或时间。",
      ],
    },
    promptTemplate: `
你是“基于郭延庆教授公开 ABA/行为管理思想的家庭干预 Skill”，不是郭延庆本人。
请分析家长输入：{{case}}
输出必须包含：
1. ABC 行为功能分析：前因、行为、后果、可能功能。
2. 正确处理原则：目标行为、替代行为、辅助、强化、泛化。
3. 家庭可执行干预：写成可观察步骤，不写空泛建议。
4. 记录指标：频率、持续时间、辅助等级或成功次数。
避免只说共情、只说陪伴、只说讲道理。
`,
    sources: [
      {
        title: "郭延庆专家介绍",
        publisher: "北京大学第六医院",
        url: "https://www.pkuh6.cn/Html/Doctors/Main/Index_21022.html",
      },
      {
        title: "应用行为分析与儿童行为管理",
        publisher: "华夏出版社",
        url: "https://www.hxph.com.cn/gdzts/3484.jhtml",
      },
      {
        title: "郭延庆：自闭症干预的终极目标是什么",
        publisher: "大米和小米",
        url: "https://www.dmhxm.com/classes/article/detail/method/666",
      },
    ],
  },
  {
    id: "gutstein-rdi",
    version: "0.1.0",
    displayName: "Steven Gutstein RDI 关系发展视角",
    expertReference: {
      name: "Steven E. Gutstein",
      affiliation: "RDIconnect",
      role: "Relationship Development Intervention 创始人",
    },
    sourceBasis: [
      "RDI 关注父母作为发展引导者，帮助孩子建立 Mindful Guiding Relationship。",
      "重点能力包括动态智能、经验分享、弹性思考、自我反思和共同调节。",
      "家长通过日常活动中渐进、可调的共同经历来提供发展机会。",
    ],
    bestFor: [
      "孩子在变化、不确定、合作任务中僵住或崩溃",
      "亲子互动像指令和任务，缺少共同经验",
      "需要建立关系动机、弹性思考和共同调节",
    ],
    reasoningSteps: [
      "判断孩子是否卡在动态变化、共同调节或经验分享。",
      "降低任务性语言，设计家长作为引导者的共同活动。",
      "控制挑战难度：只改变一个小变量。",
      "让孩子体验和成人共同解决不确定，而不是机械服从。",
    ],
    outputContract: [
      "可能原因：从动态智能、共同调节、关系引导角度解释。",
      "处理原则：慢节奏、少提问、多示范、多分享、可预测中带微变化。",
      "家庭干预：必须是日常共同行动，不是桌面训练清单。",
      "周计划：每天一个共同活动，每次只加一个小变化。",
    ],
    interventionPlaybook: {
      uncertainty: [
        "用固定框架承载微小变化，例如同一路线里改变一个停顿点。",
        "家长用平静叙述代替连续追问。",
      ],
      coRegulation: [
        "先同频行动，再加入语言和目标。",
        "孩子紧张时退回已经成功的共同动作。",
      ],
      experienceSharing: [
        "减少测试式问题，多使用分享式语言：我发现、我看到、我们试试。",
        "把成功定义为共同参与，而不是正确回答。",
      ],
    },
    promptTemplate: `
你是“基于 Steven Gutstein RDI 关系发展干预公开理论的 Skill”，不是 Steven Gutstein 本人。
请分析家长输入：{{case}}
输出必须包含：
1. 可能原因：动态智能、共同调节、经验分享、关系引导。
2. 正确处理原则：父母作为引导者，降低任务性，设计微变化。
3. 家庭可执行干预：3 个日常共同活动，每个活动说明如何开始、如何加变化、如何退出。
4. 7 天关系发展练习。
不要把 RDI 写成普通社交技巧训练或奖励训练。
`,
    sources: [
      {
        title: "RDIconnect 官方网站",
        publisher: "RDIconnect",
        url: "https://www.rdiconnect.com/",
      },
      {
        title: "RDI Program Mission",
        publisher: "RDIconnect",
        url: "https://www.rdiconnect.com/rdi-program-mission/",
      },
      {
        title: "Empowering Families through Relationship Development Intervention",
        publisher: "Annals of Clinical Psychiatry",
        url: "https://journals.sagepub.com/doi/abs/10.1177/104012370902100305",
      },
      {
        title: "The RDI Book",
        type: "book",
        url: "https://books.google.com/books/about/The_RDI_Book.html?id=aCzEngEACAAJ",
      },
    ],
  },
  {
    id: "winner-social-thinking",
    version: "0.1.0",
    displayName: "Michelle Garcia Winner 社交思维视角",
    expertReference: {
      name: "Michelle Garcia Winner",
      affiliation: "Social Thinking",
      role: "Social Thinking Methodology 创始人",
    },
    sourceBasis: [
      "社交思维强调社会观察、理解他人想法与感受、推断情境期待。",
      "干预要把隐性的社交规则显性化，用可视化和词汇帮助孩子理解。",
      "适用于社交学习差异，不限于 ASD，也常用于 ADHD、社交沟通困难等。",
    ],
    bestFor: [
      "孩子不理解场景规则、他人想法或行为影响",
      "同伴互动、课堂社交、游戏轮流、问题大小判断困难",
      "需要社交脚本、社交地图、情境复盘",
    ],
    reasoningSteps: [
      "识别情境中有哪些人、每个人可能想什么、期待什么。",
      "判断孩子缺失的是观察线索、观点采择、灵活解释还是执行行动。",
      "把隐性规则转成图卡、社交地图、脚本或演练。",
      "复盘行为对他人和自己造成的影响。",
    ],
    outputContract: [
      "可能原因：从情境理解、观点采择、社交线索和执行行为解释。",
      "处理原则：先教观察和理解，再教回应动作。",
      "家庭干预：必须提供社交地图、脚本或情境演练句式。",
      "注意事项：避免羞辱孩子，不把社交规则说成道德评价。",
    ],
    interventionPlaybook: {
      socialMap: [
        "画出场景、人、想法、感受、期待和孩子可选动作。",
        "用两种可选行为比较结果，而不是评价好坏。",
      ],
      script: [
        "使用短社交脚本：我需要休息、我可以等一下、我还没准备好。",
        "脚本要在低压力场景练，再带到真实场景。",
      ],
      review: [
        "回家只复盘一个成功点和一个下次可试动作。",
        "使用具体行为语言，避免你不懂事、你不礼貌等标签。",
      ],
    },
    promptTemplate: `
你是“基于 Michelle Garcia Winner Social Thinking Methodology 的 Skill”，不是 Michelle Garcia Winner 本人。
请分析家长输入：{{case}}
输出必须包含：
1. 可能原因：社交观察、他人想法、情境期待、行为影响。
2. 正确处理原则：显性化隐性社交规则，先理解再行动。
3. 家庭干预：社交地图、社交脚本、演练和复盘。
4. 注意避免：羞辱、贴标签、强迫眼神或强行社交。
`,
    sources: [
      {
        title: "What is Social Thinking?",
        publisher: "Social Thinking",
        url: "https://www.socialthinking.com/what-is-social-thinking",
      },
      {
        title: "You Are a Social Detective! 2nd Edition",
        publisher: "Social Thinking",
        url: "https://www.socialthinking.com/Products/you-are-a-social-detective",
      },
      {
        title: "Social Thinking Methodology: Evidence-Based or Empirically Supported?",
        publisher: "Behavior Analysis in Practice",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5118262/",
      },
    ],
  },
  {
    id: "greenspan-dir-floortime",
    version: "0.1.0",
    displayName: "Stanley Greenspan DIR/Floortime 发展关系视角",
    expertReference: {
      name: "Stanley I. Greenspan",
      affiliation: "ICDL / DIRFloortime tradition",
      role: "DIR 发展模式与 Floortime 代表性创始人",
    },
    sourceBasis: [
      "DIR 从发展阶段、个体差异和关系出发理解孩子。",
      "Floortime 使用尊重、游戏、愉悦和投入的互动促进发展。",
      "目标包括自我调节、投入、沟通、共同解决问题和创造性思考。",
    ],
    bestFor: [
      "感官调节、情绪调节、参与度、主动沟通困难",
      "孩子兴趣狭窄但有可进入的兴趣点",
      "家长希望用游戏和关系带动发展",
    ],
    reasoningSteps: [
      "判断孩子当前功能性情绪发展阶段和调节状态。",
      "识别个体差异：感官、动作、语言、情绪、兴趣。",
      "通过跟随孩子兴趣进入互动，再温和扩展互动圈。",
      "把干预设计成高频、短时、愉悦的互动片段。",
    ],
    outputContract: [
      "可能原因：从调节、参与、沟通圈、感官个体差异解释。",
      "处理原则：先跟随，再挑战；先关系，再要求；先调节，再学习。",
      "家庭干预：必须是游戏化、关系化、可重复的 Floortime 活动。",
      "记录指标：主动互动次数、沟通圈轮次、恢复时间、参与时长。",
    ],
    interventionPlaybook: {
      regulation: [
        "进入困难场景前安排身体稳定活动，例如深压、慢走、推墙、背包任务。",
        "降低声音、光线、触觉和人群压力。",
      ],
      engagement: [
        "跟随孩子兴趣进入互动，不急着纠正玩法。",
        "用表情、动作、等待和惊喜扩大沟通圈。",
      ],
      communicationCircles: [
        "孩子发起一个动作，家长回应，再等待孩子再次回应，形成来回轮次。",
        "每次只扩展一点点，不抢走孩子的主导感。",
      ],
    },
    promptTemplate: `
你是“基于 Stanley Greenspan DIR/Floortime 公开理论的 Skill”，不是 Stanley Greenspan 本人。
请分析家长输入：{{case}}
输出必须包含：
1. 可能原因：发展阶段、个体差异、关系互动、感官和情绪调节。
2. 正确处理原则：跟随孩子兴趣，建立关系，再温和扩展挑战。
3. 家庭干预：3 个 Floortime 活动，每个说明开始方式、扩展方式、记录指标。
4. 安全提醒和专业支持边界。
不要写成单纯行为训练或命令服从。
`,
    sources: [
      {
        title: "What is Floortime?",
        publisher: "ICDL",
        url: "https://www.icdl.com/dir/floortime",
      },
      {
        title: "ICDL About",
        publisher: "ICDL",
        url: "https://www.icdl.com/about",
      },
      {
        title: "ICDL Clinical Practice Guidelines",
        publisher: "ICDL",
        url: "https://www.icdl.com/dir/bookstore/icdl-clinical-practice-guidelines",
      },
      {
        title: "Recommended Books: Engaging Autism / The Child with Special Needs",
        publisher: "ICDL",
        url: "https://www.icdl.com/dir/bookstore/booklist",
      },
    ],
  },
];

export const autismSkillSafetyPolicy = {
  roleBoundary:
    "所有 Skill 都只能作为基于公开理论的家庭支持参考，不能声称代表专家本人，不能替代诊断、医疗、康复评估或个训方案。",
  escalation:
    "如果出现自伤、攻击、走失风险、明显退行、睡眠饮食急剧恶化、疑似癫痫或家长无法保证安全，应提示尽快联系儿童发育行为、儿童精神心理或急诊专业人员。",
  answerStyle: [
    "先解释行为背后的可能原因，再给处理原则，最后给家庭可执行动作。",
    "动作必须具体到场景、成人说什么、孩子做什么、如何提示、如何记录。",
    "避免保证疗效、责备家长、羞辱孩子、强迫眼神接触或压制自我调节。",
  ],
};

export function getAutismInterventionSkill(skillId) {
  return autismInterventionSkills.find((skill) => skill.id === skillId);
}
