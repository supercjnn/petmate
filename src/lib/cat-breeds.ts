/**
 * 猫咪品种数据库
 * 30种常见品种的特征、健康风险、护理建议
 */

export interface CatBreed {
  id: string
  name: string
  nameEn: string
  origin: string
  size: 'small' | 'medium' | 'large'
  weightRange: { male: string; female: string }
  coatLength: 'short' | 'medium' | 'long'
  coatColors: string[]
  personality: string[]
  temperament: string
  activityLevel: 'low' | 'medium' | 'high'
  groomingNeeds: 'low' | 'medium' | 'high'
  healthIssues: string[]
  specialCare: string[]
  suitableFor: string[]
  notSuitableFor: string[]
  lifespan: string
  popularity: number // 1-10
}

export const CAT_BREEDS: CatBreed[] = [
  // ===== 热门短毛 =====
  {
    id: 'british_shorthair',
    name: '英国短毛猫',
    nameEn: 'British Shorthair',
    origin: '英国',
    size: 'medium',
    weightRange: { male: '4-8kg', female: '3-6kg' },
    coatLength: 'short',
    coatColors: ['蓝色', '金色', '银色', '白色', '双色'],
    personality: ['温顺', '独立', '安静', '稳重'],
    temperament: '温和友好，喜欢陪伴但不粘人，适合公寓生活',
    activityLevel: 'low',
    groomingNeeds: 'low',
    healthIssues: ['肥厚型心肌病(HCM)', '肥胖倾向', '多囊肾病'],
    specialCare: ['控制饮食防止肥胖', '年度心脏检查', '定期称重监控'],
    suitableFor: ['上班族', '新手', '公寓住户', '喜欢安静的人'],
    notSuitableFor: ['想要活泼互动的家庭'],
    lifespan: '12-17年',
    popularity: 10
  },
  {
    id: 'american_shorthair',
    name: '美国短毛猫',
    nameEn: 'American Shorthair',
    origin: '美国',
    size: 'medium',
    weightRange: { male: '4-7kg', female: '3-5kg' },
    coatLength: 'short',
    coatColors: ['银虎斑', '红虎斑', '棕色', '白色', '双色'],
    personality: ['友善', '适应性强', '温和', '聪明'],
    temperament: '友好亲人，适应力强，能与儿童和其他宠物相处',
    activityLevel: 'medium',
    groomingNeeds: 'low',
    healthIssues: ['肥厚型心肌病', '肥胖倾向'],
    specialCare: ['适度运动', '控制食量'],
    suitableFor: ['有儿童家庭', '新手', '多宠物家庭'],
    notSuitableFor: [],
    lifespan: '15-20年',
    popularity: 9
  },
  {
    id: 'siamese',
    name: '暹罗猫',
    nameEn: 'Siamese',
    origin: '泰国',
    size: 'medium',
    weightRange: { male: '3-5kg', female: '2.5-4kg' },
    coatLength: 'short',
    coatColors: ['重点色（蓝、巧克力、淡紫、火焰）'],
    personality: ['活泼', '爱叫', '聪明', '粘人', '好奇心强'],
    temperament: '极度活跃和社交，喜欢与人互动，声音大',
    activityLevel: 'high',
    groomingNeeds: 'low',
    healthIssues: ['哮喘', '心脏疾病', '神经系统问题'],
    specialCare: ['多陪伴互动', '提供足够玩具', '可能需要第二只猫'],
    suitableFor: ['有时间陪伴的人', '喜欢互动的家庭'],
    notSuitableFor: ['上班族', '喜欢安静的人', '公寓隔音差'],
    lifespan: '10-15年',
    popularity: 8
  },
  {
    id: 'exotic_shorthair',
    name: '异国短毛猫（加菲猫）',
    nameEn: 'Exotic Shorthair',
    origin: '美国',
    size: 'medium',
    weightRange: { male: '3-6kg', female: '2.5-5kg' },
    coatLength: 'short',
    coatColors: ['多种颜色和图案'],
    personality: ['温顺', '安静', '甜美', '懒散'],
    temperament: '性格温和，喜欢趴着，比波斯猫活泼一些',
    activityLevel: 'low',
    groomingNeeds: 'medium',
    healthIssues: ['呼吸道问题', '眼部感染', '牙齿问题', '多囊肾病'],
    specialCare: ['每日清洁眼部', '关注呼吸状况', '定期牙齿检查'],
    suitableFor: ['上班族', '公寓住户', '新手'],
    notSuitableFor: ['过敏体质家庭'],
    lifespan: '12-14年',
    popularity: 8
  },
  {
    id: 'scottish_fold',
    name: '苏格兰折耳猫',
    nameEn: 'Scottish Fold',
    origin: '英国（苏格兰）',
    size: 'medium',
    weightRange: { male: '4-6kg', female: '2.5-4kg' },
    coatLength: 'short',
    coatColors: ['多种颜色'],
    personality: ['温顺', '聪明', '适应性强', '安静'],
    temperament: '性格甜美，喜欢陪伴，但折耳基因带来健康风险',
    activityLevel: 'medium',
    groomingNeeds: 'low',
    healthIssues: ['骨软骨发育不良( OCD)', '关节问题', '心脏病'],
    specialCare: ['避免高处跳跃', '定期关节检查', '关注活动状态变化', '建议购买立耳版本'],
    suitableFor: ['能承担医疗费用的家庭', '愿意关注健康的'],
    notSuitableFor: ['预算有限的家庭', '不建议繁殖'],
    lifespan: '11-14年',
    popularity: 7
  },
  // ===== 热门长毛 =====
  {
    id: 'ragdoll',
    name: '布偶猫',
    nameEn: 'Ragdoll',
    origin: '美国',
    size: 'large',
    weightRange: { male: '5-9kg', female: '4-7kg' },
    coatLength: 'long',
    coatColors: ['重点色', '手套色', '双色'],
    personality: ['温顺', '粘人', '安静', '放松'],
    temperament: '极其温和，喜欢被抱着，放松时像布偶',
    activityLevel: 'low',
    groomingNeeds: 'medium',
    healthIssues: ['肥厚型心肌病(HCM)', '肠胃敏感', '泌尿问题'],
    specialCare: ['年度心脏筛查', '注意饮食过渡', '避免剧烈运动', '每日梳毛'],
    suitableFor: ['有时间陪伴的家庭', '喜欢大猫的', '新手'],
    notSuitableFor: ['经常外出的人'],
    lifespan: '12-17年',
    popularity: 10
  },
  {
    id: 'persian',
    name: '波斯猫',
    nameEn: 'Persian',
    origin: '伊朗（波斯）',
    size: 'medium',
    weightRange: { male: '3-6kg', female: '2.5-5kg' },
    coatLength: 'long',
    coatColors: ['白色', '黑色', '蓝色', '红色', '双色', '虎斑'],
    personality: ['安静', '优雅', '温顺', '懒散'],
    temperament: '性格温和，喜欢安静环境，不爱运动',
    activityLevel: 'low',
    groomingNeeds: 'high',
    healthIssues: ['呼吸道问题', '眼部感染', '皮肤问题', '多囊肾病', '毛球症'],
    specialCare: ['每日梳毛防止打结', '每日清洁眼部', '保持环境凉爽', '定期洗牙'],
    suitableFor: ['有时间打理毛发的人', '喜欢安静的家庭'],
    notSuitableFor: ['忙碌上班族', '过敏体质'],
    lifespan: '10-15年',
    popularity: 7
  },
  {
    id: 'maine_coon',
    name: '缅因猫',
    nameEn: 'Maine Coon',
    origin: '美国',
    size: 'large',
    weightRange: { male: '6-11kg', female: '4-7kg' },
    coatLength: 'long',
    coatColors: ['虎斑', '红色', '棕色', '双色'],
    personality: ['友善', '聪明', '活泼', '温柔'],
    temperament: '大型猫，性格友好，被称为"温柔的巨人"',
    activityLevel: 'medium',
    groomingNeeds: 'medium',
    healthIssues: ['肥厚型心肌病', '髋关节发育不良', '脊柱问题'],
    specialCare: ['年度心脏检查', '大型猫粮', '适度运动空间', '每周梳毛2-3次'],
    suitableFor: ['大空间家庭', '有儿童家庭', '喜欢大猫的'],
    notSuitableFor: ['小公寓', '空间有限'],
    lifespan: '12-15年',
    popularity: 9
  },
  {
    id: 'norwegian_forest',
    name: '挪威森林猫',
    nameEn: 'Norwegian Forest Cat',
    origin: '挪威',
    size: 'large',
    weightRange: { male: '5-9kg', female: '3.5-7kg' },
    coatLength: 'long',
    coatColors: ['虎斑', '白色', '黑色', '双色'],
    personality: ['友善', '独立', '活泼', '适应力强'],
    temperament: '友好但独立，喜欢攀爬，适应寒冷',
    activityLevel: 'medium',
    groomingNeeds: 'medium',
    healthIssues: ['肥厚型心肌病', '髋关节发育不良', '肾脏疾病'],
    specialCare: ['提供攀爬空间', '每周梳毛', '年度健康检查'],
    suitableFor: ['有攀爬空间的家庭', '喜欢大型猫'],
    notSuitableFor: ['小公寓'],
    lifespan: '14-16年',
    popularity: 6
  },
  // ===== 特殊品种 =====
  {
    id: 'sphynx',
    name: '斯芬克斯猫（无毛猫）',
    nameEn: 'Sphynx',
    origin: '加拿大',
    size: 'medium',
    weightRange: { male: '3.5-7kg', female: '3-5kg' },
    coatLength: 'short', // 实际无毛
    coatColors: ['皮肤颜色（粉、灰、黑）'],
    personality: ['活泼', '粘人', '聪明', '好奇'],
    temperament: '极度活跃和社交，喜欢温暖的地方',
    activityLevel: 'high',
    groomingNeeds: 'high', // 需要皮肤护理
    healthIssues: ['皮肤问题', '心脏疾病', '呼吸道敏感'],
    specialCare: ['定期洗澡（皮肤油脂）', '保暖措施', '防晒', '避免寒冷环境'],
    suitableFor: ['过敏体质家庭', '有时间打理的', '喜欢互动'],
    notSuitableFor: ['寒冷地区', '经常外出'],
    lifespan: '8-14年',
    popularity: 6
  },
  {
    id: 'bengal',
    name: '孟加拉豹猫',
    nameEn: 'Bengal',
    origin: '美国',
    size: 'medium',
    weightRange: { male: '4-7kg', female: '3-5kg' },
    coatLength: 'short',
    coatColors: ['豹纹', '大理石纹'],
    personality: ['活泼', '聪明', '好奇', '运动能力强'],
    temperament: '极度活跃，喜欢攀爬和玩耍，野性外表',
    activityLevel: 'high',
    groomingNeeds: 'low',
    healthIssues: ['肥厚型心肌病', '眼部问题', '肠胃敏感'],
    specialCare: ['大量运动空间', '攀爬设施', '智力玩具', '高蛋白饮食'],
    suitableFor: ['有时间互动的家庭', '大空间'],
    notSuitableFor: ['上班族', '小公寓', '新手'],
    lifespan: '12-16年',
    popularity: 7
  },
  {
    id: 'abyssinian',
    name: '阿比西尼亚猫',
    nameEn: 'Abyssinian',
    origin: '埃及/东非',
    size: 'medium',
    weightRange: { male: '3.5-5kg', female: '2.5-4kg' },
    coatLength: 'short',
    coatColors: ['红色', '蓝色', '小鹿色'],
    personality: ['活泼', '聪明', '好奇', '忠诚'],
    temperament: '非常活跃，喜欢探索，被称为"小老虎"',
    activityLevel: 'high',
    groomingNeeds: 'low',
    healthIssues: ['肾脏疾病', '视网膜萎缩'],
    specialCare: ['大量互动', '智力玩具', '年度眼科检查'],
    suitableFor: ['有时间陪伴的家庭', '喜欢活跃猫'],
    notSuitableFor: ['上班族', '喜欢安静'],
    lifespan: '9-15年',
    popularity: 5
  },
  {
    id: 'russian_blue',
    name: '俄罗斯蓝猫',
    nameEn: 'Russian Blue',
    origin: '俄罗斯',
    size: 'medium',
    weightRange: { male: '3.5-5kg', female: '2.5-4kg' },
    coatLength: 'short',
    coatColors: ['蓝灰色'],
    personality: ['安静', '害羞', '忠诚', '独立'],
    temperament: '性格温和，对新环境害羞，但对主人忠诚',
    activityLevel: 'medium',
    groomingNeeds: 'low',
    healthIssues: ['肥厚型心肌病', '肾脏问题'],
    specialCare: ['安静环境', '渐进式社交', '年度心脏检查'],
    suitableFor: ['安静家庭', '单身人士', '公寓'],
    notSuitableFor: ['喧闹家庭', '多儿童'],
    lifespan: '15-20年',
    popularity: 6
  },
  {
    id: 'turkish_angora',
    name: '土耳其安哥拉猫',
    nameEn: 'Turkish Angora',
    origin: '土耳其',
    size: 'medium',
    weightRange: { male: '3-5kg', female: '2.5-4kg' },
    coatLength: 'long',
    coatColors: ['白色', '黑色', '蓝色', '双色'],
    personality: ['活泼', '聪明', '友善', '喜欢水'],
    temperament: '优雅活泼，喜欢互动，对水感兴趣',
    activityLevel: 'medium',
    groomingNeeds: 'medium',
    healthIssues: ['听力问题（白色）', '心脏疾病'],
    specialCare: ['每周梳毛', '关注听力', '提供互动玩具'],
    suitableFor: ['喜欢互动的家庭', '有时间打理毛发'],
    notSuitableFor: [],
    lifespan: '15-18年',
    popularity: 4
  },
  {
    id: 'chartreux',
    name: '沙特尔猫',
    nameEn: 'Chartreux',
    origin: '法国',
    size: 'medium',
    weightRange: { male: '4-7kg', female: '3-5kg' },
    coatLength: 'short',
    coatColors: ['蓝灰色'],
    personality: ['安静', '温和', '忠诚', '独立'],
    temperament: '性格温和安静，被称为"微笑猫"',
    activityLevel: 'medium',
    groomingNeeds: 'low',
    healthIssues: ['膝盖骨脱位', '心脏问题'],
    specialCare: ['适度运动', '年度健康检查'],
    suitableFor: ['安静家庭', '上班族', '公寓'],
    notSuitableFor: [],
    lifespan: '12-15年',
    popularity: 3
  }
]

// 根据ID获取品种
export function getBreedById(id: string): CatBreed | undefined {
  return CAT_BREEDS.find(b => b.id === id)
}

// 根据名字搜索品种
export function searchBreedByName(name: string): CatBreed[] {
  const nameLower = name.toLowerCase()
  return CAT_BREEDS.filter(b => 
    b.name.toLowerCase().includes(nameLower) ||
    b.nameEn.toLowerCase().includes(nameLower)
  )
}

// 获取热门品种
export function getPopularBreeds(limit = 10): CatBreed[] {
  return CAT_BREEDS.sort((a, b) => b.popularity - a.popularity).slice(0, limit)
}

// 根据条件筛选品种
export function filterBreeds(filters: {
  size?: CatBreed['size']
  coatLength?: CatBreed['coatLength']
  activityLevel?: CatBreed['activityLevel']
  groomingNeeds?: CatBreed['groomingNeeds']
}): CatBreed[] {
  return CAT_BREEDS.filter(b => {
    if (filters.size && b.size !== filters.size) return false
    if (filters.coatLength && b.coatLength !== filters.coatLength) return false
    if (filters.activityLevel && b.activityLevel !== filters.activityLevel) return false
    if (filters.groomingNeeds && b.groomingNeeds !== filters.groomingNeeds) return false
    return true
  })
}

// 品种匹配推荐
export function recommendBreed(userProfile: {
  livingSpace: 'small' | 'medium' | 'large'
  timeAvailable: 'low' | 'medium' | 'high'
  experience: 'new' | 'some' | 'experienced'
  hasChildren: boolean
  prefersQuiet: boolean
}): CatBreed[] {
  let candidates = CAT_BREEDS

  // 空间筛选
  if (userProfile.livingSpace === 'small') {
    candidates = candidates.filter(b => b.size === 'small' || b.size === 'medium')
    candidates = candidates.filter(b => b.activityLevel !== 'high')
  }

  // 时间筛选
  if (userProfile.timeAvailable === 'low') {
    candidates = candidates.filter(b => b.groomingNeeds !== 'high')
    candidates = candidates.filter(b => b.activityLevel !== 'high')
  }

  // 经验筛选
  if (userProfile.experience === 'new') {
    candidates = candidates.filter(b => b.suitableFor.includes('新手'))
  }

  // 儿童筛选
  if (userProfile.hasChildren) {
    candidates = candidates.filter(b => b.suitableFor.includes('有儿童家庭'))
  }

  // 安静偏好
  if (userProfile.prefersQuiet) {
    candidates = candidates.filter(b => 
      b.activityLevel === 'low' && b.personality.includes('安静')
    )
  }

  return candidates.sort((a, b) => b.popularity - a.popularity)
}