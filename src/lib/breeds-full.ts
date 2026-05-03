/**
 * 完整品种知识图谱
 * 30+热门品种的详细养护指南
 */

import { BreedKnowledge } from './rag'

// ============ 品种数据 ============

export const BREED_DATABASE: Record<string, BreedKnowledge> = {
  // ========== 短毛品种 ==========
  'british-shorthair': {
    breedId: 'british-shorthair',
    breedName: '英国短毛猫',
    characteristics: {
      personality: ['温顺', '独立', '友善', '安静'],
      activityLevel: 'medium',
      groomingNeeds: 'low',
      healthIssues: ['肥胖倾向', '心脏病(HCM)', '多囊肾病'],
      lifespan: '12-17年',
      weightRange: { min: 4, max: 8 }
    },
    careGuide: {
      feeding: ['控制食量防止肥胖', '高蛋白低碳水食物', '定时定量喂养'],
      grooming: ['每周梳毛1-2次', '定期检查耳朵', '修剪指甲'],
      exercise: ['每天15-30分钟互动', '提供攀爬空间', '益智玩具'],
      healthCheck: ['年度心脏检查', '体重监测', '肾脏功能检查']
    },
    commonProblems: [
      { problem: '过度肥胖', solution: '控制饮食+增加运动', severity: 'high' },
      { problem: '懒惰不爱动', solution: '用玩具激发兴趣', severity: 'low' },
      { problem: '毛发打结', solution: '定期梳毛', severity: 'low' }
    ],
    expertTips: [
      '英短容易发胖，建议使用自动喂食器控制食量',
      '性格独立但喜欢陪伴，每天至少花30分钟互动',
      '注意观察呼吸情况，HCM早期很难发现'
    ]
  },

  'american-shorthair': {
    breedId: 'american-shorthair',
    breedName: '美国短毛猫',
    characteristics: {
      personality: ['活泼', '好奇', '友善', '适应性强'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['心脏病', '肥胖', '尿路问题'],
      lifespan: '15-20年',
      weightRange: { min: 3.5, max: 7 }
    },
    careGuide: {
      feeding: ['高蛋白食物', '控制热量', '充足饮水'],
      grooming: ['每周梳毛', '定期清洁', '检查牙齿'],
      exercise: ['充足活动空间', '互动游戏', '攀爬架'],
      healthCheck: ['年度体检', '心脏筛查', '尿路检查']
    },
    commonProblems: [
      { problem: '过度活跃', solution: '提供足够玩具和空间', severity: 'low' },
      { problem: '尿路感染', solution: '多喝水+定期检查', severity: 'medium' },
      { problem: '抓挠家具', solution: '提供猫抓板', severity: 'low' }
    ],
    expertTips: [
      '美短精力旺盛，需要足够的活动空间',
      '好奇心强，注意家中安全隐患',
      '定期尿路检查很重要'
    ]
  },

  'ragdoll': {
    breedId: 'ragdoll',
    breedName: '布偶猫',
    characteristics: {
      personality: ['温柔', '粘人', '安静', '忍耐力强'],
      activityLevel: 'low',
      groomingNeeds: 'medium',
      healthIssues: ['心脏病(HCM)', '膀胱结石', '肠胃敏感'],
      lifespan: '12-16年',
      weightRange: { min: 4.5, max: 9 }
    },
    careGuide: {
      feeding: ['易消化食物', '少量多餐', '充足饮水'],
      grooming: ['每天梳毛', '定期洗澡', '注意毛发清洁'],
      exercise: ['温和互动', '避免剧烈运动', '室内活动为主'],
      healthCheck: ['心脏超声', '尿液检查', '肠胃功能']
    },
    commonProblems: [
      { problem: '毛发过长打结', solution: '每天梳毛+定期洗澡', severity: 'medium' },
      { problem: '肠胃不适', solution: '选择低敏食物', severity: 'medium' },
      { problem: '过度依赖主人', solution: '逐步培养独立性', severity: 'low' }
    ],
    expertTips: [
      '布偶猫非常粘人，不适合长时间独处',
      '肠胃敏感，换粮要循序渐进',
      '定期心脏检查非常重要'
    ]
  },

  'siamese': {
    breedId: 'siamese',
    breedName: '暹罗猫',
    characteristics: {
      personality: ['聪明', '话多', '粘人', '活泼'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['呼吸道问题', '心脏病', '牙齿问题'],
      lifespan: '12-15年',
      weightRange: { min: 2.5, max: 5.5 }
    },
    careGuide: {
      feeding: ['高蛋白食物', '控制体重', '注意呼吸道营养'],
      grooming: ['简单护理', '定期清洁耳朵', '口腔护理'],
      exercise: ['大量互动', '智力游戏', '垂直空间'],
      healthCheck: ['呼吸道检查', '心脏筛查', '牙齿检查']
    },
    commonProblems: [
      { problem: '过度吵闹', solution: '多陪伴互动', severity: 'medium' },
      { problem: '分离焦虑', solution: '提供玩具和陪伴', severity: 'high' },
      { problem: '破坏家具', solution: '足够的玩具', severity: 'medium' }
    ],
    expertTips: [
      '暹罗猫非常聪明，需要大量精神刺激',
      '喜欢"聊天"，要做好准备',
      '不适合长时间独处'
    ]
  },

  'russian-blue': {
    breedId: 'russian-blue',
    breedName: '俄罗斯蓝猫',
    characteristics: {
      personality: ['害羞', '安静', '忠诚', '独立'],
      activityLevel: 'medium',
      groomingNeeds: 'low',
      healthIssues: ['心脏病', '尿路问题'],
      lifespan: '15-20年',
      weightRange: { min: 3, max: 6 }
    },
    careGuide: {
      feeding: ['高质量蛋白', '控制体重', '充足饮水'],
      grooming: ['每周梳毛', '保持毛发光泽', '定期检查'],
      exercise: ['温和互动', '攀爬空间', '智力游戏'],
      healthCheck: ['心脏检查', '尿路筛查', '年度体检']
    },
    commonProblems: [
      { problem: '对陌生人害羞', solution: '慢慢引导社会化', severity: 'low' },
      { problem: '容易受惊', solution: '保持环境安静', severity: 'medium' }
    ],
    expertTips: [
      '俄蓝对主人非常忠诚，但对陌生人害羞',
      '喜欢规律的生活节奏',
      '毛发有独特光泽，需要适当护理'
    ]
  },

  'exotic-shorthair': {
    breedId: 'exotic-shorthair',
    breedName: '异国短毛猫(加菲)',
    characteristics: {
      personality: ['温顺', '安静', '甜美', '依赖'],
      activityLevel: 'low',
      groomingNeeds: 'medium',
      healthIssues: ['呼吸道问题', '眼部感染', '心脏病'],
      lifespan: '12-15年',
      weightRange: { min: 3, max: 7 }
    },
    careGuide: {
      feeding: ['易消化食物', '小颗粒猫粮', '避免过胖'],
      grooming: ['每天清洁眼部', '面部护理', '定期梳毛'],
      exercise: ['温和互动', '避免剧烈运动', '室内活动'],
      healthCheck: ['眼部检查', '呼吸道检查', '心脏筛查']
    },
    commonProblems: [
      { problem: '泪痕严重', solution: '每天清洁眼部', severity: 'high' },
      { problem: '呼吸困难', solution: '保持环境凉爽', severity: 'high' },
      { problem: '眼睑内翻', solution: '需要手术矫正', severity: 'medium' }
    ],
    expertTips: [
      '加菲需要每天清洁眼睛',
      '注意呼吸问题，避免过热环境',
      '不适合户外活动'
    ]
  },

  // ========== 长毛品种 ==========
  'persian': {
    breedId: 'persian',
    breedName: '波斯猫',
    characteristics: {
      personality: ['安静', '优雅', '温顺', '慵懒'],
      activityLevel: 'low',
      groomingNeeds: 'high',
      healthIssues: ['呼吸道问题', '眼部感染', '多囊肾病', '心脏病'],
      lifespan: '10-15年',
      weightRange: { min: 3.5, max: 7 }
    },
    careGuide: {
      feeding: ['高质量猫粮', '控制体重', '避免过热食物'],
      grooming: ['每天梳毛', '定期洗澡', '眼部护理'],
      exercise: ['轻度活动', '室内为主', '避免跳高'],
      healthCheck: ['心脏检查', '肾脏检查', '眼部检查']
    },
    commonProblems: [
      { problem: '毛发打结', solution: '每天梳毛必须坚持', severity: 'high' },
      { problem: '泪痕', solution: '定期清洁眼部', severity: 'high' },
      { problem: '呼吸困难', solution: '保持凉爽环境', severity: 'high' }
    ],
    expertTips: [
      '波斯猫需要大量护理时间，新手需谨慎',
      '面部结构导致多种健康问题',
      '选择负责任的繁育者很重要'
    ]
  },

  'maine-coon': {
    breedId: 'maine-coon',
    breedName: '缅因猫',
    characteristics: {
      personality: ['友善', '聪明', '温和', '狗一样'],
      activityLevel: 'medium',
      groomingNeeds: 'medium',
      healthIssues: ['心脏病(HCM)', '髋关节发育不良', '脊髓性肌萎缩'],
      lifespan: '12-15年',
      weightRange: { min: 5, max: 11 }
    },
    careGuide: {
      feeding: ['高蛋白大颗粒', '充足食物', '控制体重'],
      grooming: ['每周梳毛2-3次', '注意毛发质量', '换毛季加强护理'],
      exercise: ['大型空间', '攀爬架', '互动游戏'],
      healthCheck: ['心脏筛查', '髋关节检查', '年度体检']
    },
    commonProblems: [
      { problem: '体型过大需要空间', solution: '准备大型猫爬架', severity: 'medium' },
      { problem: '食量大开销高', solution: '预算规划', severity: 'low' },
      { problem: '毛发打理', solution: '定期梳毛', severity: 'medium' }
    ],
    expertTips: [
      '缅因猫是最大的家猫品种之一',
      '性格像狗，非常亲人',
      '需要较大的生活空间'
    ]
  },

  'norwegian-forest': {
    breedId: 'norwegian-forest',
    breedName: '挪威森林猫',
    characteristics: {
      personality: ['独立', '友善', '勇敢', '爱攀爬'],
      activityLevel: 'high',
      groomingNeeds: 'medium',
      healthIssues: ['心脏病', '髋关节问题', '糖原贮积病'],
      lifespan: '12-16年',
      weightRange: { min: 4, max: 9 }
    },
    careGuide: {
      feeding: ['高蛋白', '控制体重', '充足饮水'],
      grooming: ['每周梳毛', '换毛季加强', '保持干燥'],
      exercise: ['攀爬空间', '户外可考虑', '互动游戏'],
      healthCheck: ['心脏检查', '关节检查', '年度体检']
    },
    commonProblems: [
      { problem: '爱攀爬', solution: '提供高处空间', severity: 'medium' },
      { problem: '换毛季掉毛多', solution: '加强梳毛', severity: 'medium' }
    ],
    expertTips: [
      '挪威森林猫适应力强',
      '喜欢攀爬，需要垂直空间',
      '双层被毛需要适当护理'
    ]
  },

  'siberian': {
    breedId: 'siberian',
    breedName: '西伯利亚猫',
    characteristics: {
      personality: ['友善', '聪明', '独立', '水友好'],
      activityLevel: 'medium',
      groomingNeeds: 'medium',
      healthIssues: ['心脏病(HCM)'],
      lifespan: '12-15年',
      weightRange: { min: 4, max: 9 }
    },
    careGuide: {
      feeding: ['高蛋白', '控制体重', '优质食物'],
      grooming: ['每周梳毛', '换毛季加强', '注意防水'],
      exercise: ['互动游戏', '攀爬空间', '智力玩具'],
      healthCheck: ['心脏筛查', '年度体检']
    },
    commonProblems: [
      { problem: '掉毛较多', solution: '定期梳毛', severity: 'medium' }
    ],
    expertTips: [
      '西伯利亚猫对猫过敏者可能较友好（Fel d 1蛋白较少）',
      '喜欢玩水，这是该品种特点',
      '性格像狗，非常忠诚'
    ]
  },

  'birman': {
    breedId: 'birman',
    breedName: '伯曼猫',
    characteristics: {
      personality: ['温柔', '友善', '安静', '聪明'],
      activityLevel: 'medium',
      groomingNeeds: 'medium',
      healthIssues: ['先天性畸形', '心脏病'],
      lifespan: '13-15年',
      weightRange: { min: 3.5, max: 7 }
    },
    careGuide: {
      feeding: ['高质量蛋白', '控制体重', '定时定量'],
      grooming: ['每周梳毛', '注意毛发质量', '检查耳朵'],
      exercise: ['温和互动', '攀爬空间', '玩具'],
      healthCheck: ['心脏检查', '年度体检']
    },
    commonProblems: [
      { problem: '毛发打结', solution: '定期梳毛', severity: 'medium' }
    ],
    expertTips: [
      '伯曼猫被称为"缅甸圣猫"',
      '性格温和，适合家庭',
      '蓝色眼睛是标志性特征'
    ]
  },

  'himalayan': {
    breedId: 'himalayan',
    breedName: '喜马拉雅猫',
    characteristics: {
      personality: ['安静', '温顺', '甜美', '慵懒'],
      activityLevel: 'low',
      groomingNeeds: 'high',
      healthIssues: ['呼吸道问题', '眼部感染', '多囊肾病', '心脏病'],
      lifespan: '10-15年',
      weightRange: { min: 3.5, max: 7 }
    },
    careGuide: {
      feeding: ['易消化食物', '控制体重', '小颗粒猫粮'],
      grooming: ['每天梳毛', '定期洗澡', '眼部护理'],
      exercise: ['轻度活动', '室内为主', '避免剧烈'],
      healthCheck: ['心脏检查', '肾脏检查', '眼部检查']
    },
    commonProblems: [
      { problem: '毛发护理量大', solution: '建立日常护理习惯', severity: 'high' },
      { problem: '呼吸问题', solution: '保持凉爽环境', severity: 'high' },
      { problem: '泪痕', solution: '每天清洁', severity: 'high' }
    ],
    expertTips: [
      '喜马拉雅猫是波斯和暹罗的混血',
      '需要大量护理时间',
      '新手不建议选择'
    ]
  },

  // ========== 无毛/短毛品种 ==========
  'sphynx': {
    breedId: 'sphynx',
    breedName: '斯芬克斯猫',
    characteristics: {
      personality: ['外向', '粘人', '聪明', '温暖'],
      activityLevel: 'high',
      groomingNeeds: 'medium',
      healthIssues: ['皮肤问题', '心脏病(HCM)', '体温调节'],
      lifespan: '12-15年',
      weightRange: { min: 3.5, max: 7 }
    },
    careGuide: {
      feeding: ['高代谢需多食', '优质蛋白', '控制体重'],
      grooming: ['定期洗澡', '皮肤护理', '防晒保暖'],
      exercise: ['大量互动', '温暖环境', '智力游戏'],
      healthCheck: ['心脏筛查', '皮肤检查', '年度体检']
    },
    commonProblems: [
      { problem: '皮肤出油', solution: '定期洗澡', severity: 'medium' },
      { problem: '怕冷', solution: '提供保暖衣物', severity: 'high' },
      { problem: '晒伤风险', solution: '避免阳光直射', severity: 'high' }
    ],
    expertTips: [
      '斯芬克斯不是完全无毛，有细微绒毛',
      '体温调节能力弱，需要保暖',
      '性格像狗，非常粘人'
    ]
  },

  'devon-rex': {
    breedId: 'devon-rex',
    breedName: '德文卷毛猫',
    characteristics: {
      personality: ['活泼', '聪明', '粘人', '淘气'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['心脏病(HCM)', '肌肉无力症', '皮肤问题'],
      lifespan: '10-15年',
      weightRange: { min: 2.5, max: 4.5 }
    },
    careGuide: {
      feeding: ['高蛋白', '控制体重', '优质食物'],
      grooming: ['轻柔护理', '避免过度清洁', '保持温暖'],
      exercise: ['大量互动', '攀爬空间', '智力游戏'],
      healthCheck: ['心脏筛查', '肌肉检查', '年度体检']
    },
    commonProblems: [
      { problem: '过于活泼', solution: '提供足够刺激', severity: 'medium' },
      { problem: '怕冷', solution: '保持温暖环境', severity: 'medium' }
    ],
    expertTips: [
      '德文卷毛猫像小精灵一样',
      '非常聪明，能学会很多技能',
      '被称为"披着猫皮的猴子"'
    ]
  },

  'cornish-rex': {
    breedId: 'cornish-rex',
    breedName: '康沃尔卷毛猫',
    characteristics: {
      personality: ['活泼', '聪明', '社交', '好动'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['心脏病', '皮肤问题', '血型问题'],
      lifespan: '12-15年',
      weightRange: { min: 2.5, max: 4.5 }
    },
    careGuide: {
      feeding: ['高代谢需多食', '优质蛋白', '控制体重'],
      grooming: ['轻柔护理', '保持皮肤健康', '避免过度清洁'],
      exercise: ['大量活动空间', '互动游戏', '攀爬架'],
      healthCheck: ['心脏筛查', '皮肤检查', '年度体检']
    },
    commonProblems: [
      { problem: '过于好动', solution: '提供足够刺激', severity: 'medium' },
      { problem: '怕冷', solution: '保暖措施', severity: 'medium' }
    ],
    expertTips: [
      '康沃尔卷毛猫像狗一样活泼',
      '需要大量互动和游戏',
      '单层被毛，怕冷'
    ]
  },

  // ========== 亚洲品种 ==========
  'chinese-garden-cat': {
    breedId: 'chinese-garden-cat',
    breedName: '中华田园猫',
    characteristics: {
      personality: ['独立', '聪明', '适应性强', '健康'],
      activityLevel: 'medium',
      groomingNeeds: 'low',
      healthIssues: ['较少遗传病'],
      lifespan: '15-20年',
      weightRange: { min: 2.5, max: 6 }
    },
    careGuide: {
      feeding: ['普通猫粮即可', '控制体重', '充足饮水'],
      grooming: ['简单护理', '定期清洁', '检查寄生虫'],
      exercise: ['自由活动', '户外可考虑', '玩具互动'],
      healthCheck: ['疫苗驱虫', '年度体检', '绝育手术']
    },
    commonProblems: [
      { problem: '可能较独立', solution: '耐心培养感情', severity: 'low' },
      { problem: '户外风险', solution: '室内养护或监护外出', severity: 'medium' }
    ],
    expertTips: [
      '中华田园猫是最健康适应力最强的猫',
      '没有繁育缺陷，寿命长',
      '橘猫、三花、狸花等各有特点'
    ]
  },

  'japanese-bobtail': {
    breedId: 'japanese-bobtail',
    breedName: '日本短尾猫',
    characteristics: {
      personality: ['友善', '活泼', '聪明', '爱水'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['较少遗传病'],
      lifespan: '15-18年',
      weightRange: { min: 2.5, max: 5 }
    },
    careGuide: {
      feeding: ['优质猫粮', '控制体重', '定时定量'],
      grooming: ['简单护理', '定期清洁', '检查尾巴'],
      exercise: ['大量互动', '攀爬空间', '智力游戏'],
      healthCheck: ['年度体检', '疫苗驱虫']
    },
    commonProblems: [
      { problem: '尾巴需要清洁', solution: '定期检查清洁', severity: 'low' }
    ],
    expertTips: [
      '日本短尾猫是招财猫的原型',
      '短尾是自然基因突变',
      '性格活泼友善'
    ]
  },

  // ========== 其他热门品种 ==========
  'bengal': {
    breedId: 'bengal',
    breedName: '孟加拉豹猫',
    characteristics: {
      personality: ['活跃', '聪明', '野性', '运动'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['心脏病(HCM)', '进行性视网膜萎缩'],
      lifespan: '12-16年',
      weightRange: { min: 4, max: 7 }
    },
    careGuide: {
      feeding: ['高蛋白', '控制体重', '优质食物'],
      grooming: ['简单护理', '保持毛发亮泽', '定期检查'],
      exercise: ['大量空间', '互动游戏', '攀爬架'],
      healthCheck: ['心脏筛查', '眼部检查', '年度体检']
    },
    commonProblems: [
      { problem: '过度活跃', solution: '提供足够刺激', severity: 'high' },
      { problem: '破坏行为', solution: '足够的玩具和空间', severity: 'medium' }
    ],
    expertTips: [
      '孟加拉猫需要大量活动和刺激',
      '有野性血统，不适合新手',
      '非常聪明，能学会很多技能'
    ]
  },

  'scottish-fold': {
    breedId: 'scottish-fold',
    breedName: '苏格兰折耳猫',
    characteristics: {
      personality: ['温顺', '安静', '粘人', '可爱'],
      activityLevel: 'medium',
      groomingNeeds: 'low',
      healthIssues: ['骨软骨发育不良', '关节炎', '心脏病'],
      lifespan: '11-14年',
      weightRange: { min: 2.5, max: 6 }
    },
    careGuide: {
      feeding: ['控制体重', '关节健康营养', '优质食物'],
      grooming: ['简单护理', '耳朵清洁', '定期检查'],
      exercise: ['温和活动', '避免跳跃', '软垫保护'],
      healthCheck: ['骨科检查', '心脏筛查', '年度体检']
    },
    commonProblems: [
      { problem: '关节问题', solution: '定期检查+营养补充', severity: 'high' },
      { problem: '行动不便', solution: '提供软垫环境', severity: 'high' }
    ],
    expertTips: [
      '折耳猫存在严重的遗传健康问题',
      '建议选择立耳版或考虑其他品种',
      '如果已饲养，定期骨科检查很重要'
    ]
  },

  'abyssinian': {
    breedId: 'abyssinian',
    breedName: '阿比西尼亚猫',
    characteristics: {
      personality: ['活跃', '聪明', '好奇', '忠诚'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['肾病(PKD)', '进行性视网膜萎缩', '心脏病'],
      lifespan: '12-15年',
      weightRange: { min: 2.5, max: 5 }
    },
    careGuide: {
      feeding: ['高蛋白', '充足饮水', '肾脏健康食物'],
      grooming: ['简单护理', '定期清洁', '检查眼睛'],
      exercise: ['大量活动', '攀爬空间', '智力游戏'],
      healthCheck: ['肾脏检查', '眼部检查', '心脏筛查']
    },
    commonProblems: [
      { problem: '过度活跃', solution: '提供足够刺激', severity: 'medium' },
      { problem: '肾脏问题', solution: '定期检查+充足饮水', severity: 'high' }
    ],
    expertTips: [
      '阿比西尼亚猫是最古老的品种之一',
      '非常活跃，需要大量互动',
      '注意肾脏健康'
    ]
  },

  'somalii': {
    breedId: 'somali',
    breedName: '索马里猫',
    characteristics: {
      personality: ['活泼', '聪明', '好奇', '社交'],
      activityLevel: 'high',
      groomingNeeds: 'medium',
      healthIssues: ['肾病(PKD)', '牙周病', '心脏病'],
      lifespan: '12-15年',
      weightRange: { min: 2.5, max: 5 }
    },
    careGuide: {
      feeding: ['高蛋白', '口腔健康食物', '充足饮水'],
      grooming: ['每周梳毛', '换毛季加强', '口腔护理'],
      exercise: ['大量活动', '攀爬空间', '智力游戏'],
      healthCheck: ['肾脏检查', '口腔检查', '心脏筛查']
    },
    commonProblems: [
      { problem: '毛发打结', solution: '定期梳毛', severity: 'medium' },
      { problem: '牙周病', solution: '口腔护理', severity: 'medium' }
    ],
    expertTips: [
      '索马里猫是长毛版阿比西尼亚',
      '同样活跃且需要刺激',
      '注意口腔和肾脏健康'
    ]
  },

  'oriental-shorthair': {
    breedId: 'oriental-shorthair',
    breedName: '东方短毛猫',
    characteristics: {
      personality: ['话多', '聪明', '粘人', '好奇'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['心脏病', '牙齿问题', '呼吸道问题'],
      lifespan: '12-15年',
      weightRange: { min: 2.5, max: 5 }
    },
    careGuide: {
      feeding: ['高蛋白', '控制体重', '优质食物'],
      grooming: ['简单护理', '定期清洁', '口腔护理'],
      exercise: ['大量互动', '攀爬空间', '智力游戏'],
      healthCheck: ['心脏筛查', '牙齿检查', '年度体检']
    },
    commonProblems: [
      { problem: '过度吵闹', solution: '多陪伴互动', severity: 'medium' },
      { problem: '分离焦虑', solution: '提供玩具和陪伴', severity: 'medium' }
    ],
    expertTips: [
      '东方短毛猫像暹罗猫一样话多',
      '非常粘人，不适合独处',
      '需要大量精神刺激'
    ]
  },

  'turkish-angora': {
    breedId: 'turkish-angora',
    breedName: '土耳其安哥拉猫',
    characteristics: {
      personality: ['优雅', '活泼', '聪明', '爱水'],
      activityLevel: 'high',
      groomingNeeds: 'medium',
      healthIssues: ['心脏病(HCM)', '耳聋（白猫）'],
      lifespan: '15-18年',
      weightRange: { min: 2.5, max: 5 }
    },
    careGuide: {
      feeding: ['优质蛋白', '控制体重', '定时定量'],
      grooming: ['每周梳毛', '换毛季加强', '保持光泽'],
      exercise: ['大量活动', '攀爬空间', '互动游戏'],
      healthCheck: ['心脏筛查', '听力检查（白猫）', '年度体检']
    },
    commonProblems: [
      { problem: '白色蓝眼猫耳聋率高', solution: '听力测试', severity: 'medium' },
      { problem: '毛发护理', solution: '定期梳毛', severity: 'medium' }
    ],
    expertTips: [
      '安哥拉猫是古老的天然品种',
      '喜欢水，可能会玩水碗',
      '非常聪明优雅'
    ]
  },

  'balinese': {
    breedId: 'balinese',
    breedName: '巴厘猫',
    characteristics: {
      personality: ['聪明', '话多', '粘人', '优雅'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['心脏病', '呼吸道问题', '牙齿问题'],
      lifespan: '12-16年',
      weightRange: { min: 2.5, max: 5 }
    },
    careGuide: {
      feeding: ['高蛋白', '控制体重', '优质食物'],
      grooming: ['简单护理', '轻柔梳毛', '口腔清洁'],
      exercise: ['大量互动', '攀爬空间', '智力游戏'],
      healthCheck: ['心脏筛查', '呼吸道检查', '口腔检查']
    },
    commonProblems: [
      { problem: '过度吵闹', solution: '多陪伴互动', severity: 'medium' },
      { problem: '分离焦虑', solution: '提供陪伴和玩具', severity: 'high' }
    ],
    expertTips: [
      '巴厘猫是长毛版暹罗猫',
      '同样话多且粘人',
      '不适合独处'
    ]
  },

  'chartreux': {
    breedId: 'chartreux',
    breedName: '沙特尔猫',
    characteristics: {
      personality: ['安静', '温和', '独立', '忠诚'],
      activityLevel: 'medium',
      groomingNeeds: 'low',
      healthIssues: ['心脏病', '膝盖骨脱位'],
      lifespan: '12-15年',
      weightRange: { min: 4, max: 7 }
    },
    careGuide: {
      feeding: ['控制体重', '优质蛋白', '定时定量'],
      grooming: ['简单护理', '保持毛色', '定期清洁'],
      exercise: ['适度活动', '攀爬空间', '互动游戏'],
      healthCheck: ['心脏筛查', '关节检查', '年度体检']
    },
    commonProblems: [
      { problem: '体重管理', solution: '控制饮食', severity: 'medium' }
    ],
    expertTips: [
      '沙特尔猫被称为"微笑猫"',
      '安静温和，适合公寓',
      '法国国宝级品种'
    ]
  },

  'singapura': {
    breedId: 'singapura',
    breedName: '新加坡猫',
    characteristics: {
      personality: ['活泼', '好奇', '粘人', '友善'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['较少遗传病', '子宫蓄脓（母猫）'],
      lifespan: '12-15年',
      weightRange: { min: 1.5, max: 3 }
    },
    careGuide: {
      feeding: ['小份量', '优质蛋白', '控制体重'],
      grooming: ['简单护理', '定期清洁', '检查耳朵'],
      exercise: ['大量互动', '攀爬空间', '智力游戏'],
      healthCheck: ['年度体检', '绝育手术']
    },
    commonProblems: [
      { problem: '体型太小易受伤', solution: '注意安全', severity: 'medium' }
    ],
    expertTips: [
      '新加坡猫是最小的家猫品种',
      '活泼好动，像永远长不大',
      '适合喜欢小猫的家庭'
    ]
  },

  'manx': {
    breedId: 'manx',
    breedName: '曼岛猫',
    characteristics: {
      personality: ['友善', '聪明', '猎手', '独立'],
      activityLevel: 'medium',
      groomingNeeds: 'low',
      healthIssues: ['曼岛综合征（脊柱问题）', '关节炎'],
      lifespan: '12-14年',
      weightRange: { min: 3, max: 5.5 }
    },
    careGuide: {
      feeding: ['控制体重', '优质食物', '定时定量'],
      grooming: ['简单护理', '定期清洁', '检查脊柱'],
      exercise: ['适度活动', '互动游戏', '安全环境'],
      healthCheck: ['脊柱检查', '关节检查', '年度体检']
    },
    commonProblems: [
      { problem: '脊柱问题', solution: '选择负责任繁育者', severity: 'high' },
      { problem: '行动问题', solution: '及时就医', severity: 'high' }
    ],
    expertTips: [
      '曼岛猫无尾是基因突变',
      '存在曼岛综合征风险',
      '选择有尾或半尾版本更健康'
    ]
  },

  'ocicat': {
    breedId: 'ocicat',
    breedName: '欧西猫',
    characteristics: {
      personality: ['友善', '活跃', '社交', '聪明'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['较少遗传病', '肾病'],
      lifespan: '12-15年',
      weightRange: { min: 3, max: 6 }
    },
    careGuide: {
      feeding: ['高蛋白', '控制体重', '优质食物'],
      grooming: ['简单护理', '保持毛发亮泽', '定期清洁'],
      exercise: ['大量活动', '攀爬空间', '互动游戏'],
      healthCheck: ['肾脏检查', '年度体检']
    },
    commonProblems: [
      { problem: '过度活跃', solution: '提供足够刺激', severity: 'medium' }
    ],
    expertTips: [
      '欧西猫看起来像野生但完全驯化',
      '非常友善和社交',
      '适合有其他宠物的家庭'
    ]
  },

  'savannah': {
    breedId: 'savannah',
    breedName: '萨凡纳猫',
    characteristics: {
      personality: ['活跃', '聪明', '野性', '忠诚'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['心脏病', '肥胖', '饮食问题'],
      lifespan: '12-20年',
      weightRange: { min: 4, max: 11 }
    },
    careGuide: {
      feeding: ['高蛋白', '控制体重', '避免谷物'],
      grooming: ['简单护理', '定期清洁', '检查耳朵'],
      exercise: ['超大空间', '户外活动', '智力游戏'],
      healthCheck: ['心脏筛查', '年度体检', '疫苗接种']
    },
    commonProblems: [
      { problem: '需要大量空间', solution: '提供足够活动区域', severity: 'high' },
      { problem: '饮食敏感', solution: '选择合适的食物', severity: 'medium' }
    ],
    expertTips: [
      '萨凡纳猫是薮猫杂交品种',
      '需要大量空间和刺激',
      '某些代数在部分国家受限'
    ]
  }
}

// ============ 查询函数 ============

/**
 * 获取所有品种列表
 */
export function getAllBreeds(): Array<{ id: string; name: string; activityLevel: string }> {
  return Object.values(BREED_DATABASE).map(breed => ({
    id: breed.breedId,
    name: breed.breedName,
    activityLevel: breed.characteristics.activityLevel
  }))
}

/**
 * 按活跃度筛选品种
 */
export function getBreedsByActivity(level: 'low' | 'medium' | 'high'): BreedKnowledge[] {
  return Object.values(BREED_DATABASE).filter(
    breed => breed.characteristics.activityLevel === level
  )
}

/**
 * 搜索品种
 */
export function searchBreeds(query: string): BreedKnowledge[] {
  const lowerQuery = query.toLowerCase()
  return Object.values(BREED_DATABASE).filter(breed => 
    breed.breedName.toLowerCase().includes(lowerQuery) ||
    breed.characteristics.personality.some(p => p.includes(query))
  )
}

/**
 * 获取品种推荐（基于用户条件）
 */
export function getBreedRecommendations(criteria: {
  livingSpace: 'small' | 'medium' | 'large'
  activityPreference: 'low' | 'medium' | 'high'
  groomingTime: 'minimal' | 'moderate' | 'plenty'
  experience: 'beginner' | 'intermediate' | 'advanced'
}): BreedKnowledge[] {
  return Object.values(BREED_DATABASE)
    .map(breed => {
      let score = 0
      
      // 空间匹配
      if (criteria.livingSpace === 'small' && breed.characteristics.activityLevel === 'low') score += 2
      if (criteria.livingSpace === 'large' && breed.characteristics.activityLevel === 'high') score += 2
      
      // 活跃度匹配
      if (breed.characteristics.activityLevel === criteria.activityPreference) score += 3
      
      // 护理时间匹配
      if (criteria.groomingTime === 'minimal' && breed.characteristics.groomingNeeds === 'low') score += 2
      if (criteria.groomingTime === 'plenty' && breed.characteristics.groomingNeeds === 'high') score += 2
      
      // 经验匹配
      if (criteria.experience === 'beginner' && breed.characteristics.healthIssues.length <= 2) score += 1
      
      return { breed, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.breed)
}