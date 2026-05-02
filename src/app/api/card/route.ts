import { NextRequest, NextResponse } from 'next/server'
import { loadDailyCard } from '@/lib/engine'
import { personalizeActionCard, BREEDS, getActivityRecommendation } from '@/lib/breed-engine'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const day = parseInt(searchParams.get('day') || '1')
  const breedId = searchParams.get('breed') || ''
  const userExperience = searchParams.get('experience') as 'beginner' | 'intermediate' | 'experienced' || 'beginner'
  
  try {
    // 加载基础行动卡
    const card = loadDailyCard(day)
    
    if (!card) {
      return NextResponse.json({
        success: false,
        error: `Day ${day} 行动卡不存在`
      }, { status: 404 })
    }
    
    // 检查是否需要个性化
    let personalizedCard = card
    
    if (breedId && BREEDS[breedId]) {
      personalizedCard = personalizeActionCard(card, {
        breedId,
        userExperience,
        homeEnvironment: 'single',
        catAge: 'kitten'
      })
      
      // 添加品种信息
      personalizedCard.breedInfo = {
        name: BREEDS[breedId].name,
        activityRecommendation: getActivityRecommendation(breedId)
      }
    }
    
    // 检查访问权限（Day 4+ 需要付费）
    const hasAccess = day <= 3 // 简化版本，实际应检查用户付费状态
    
    return NextResponse.json({
      success: true,
      data: {
        card: personalizedCard,
        hasAccess,
        isPreview: !hasAccess && day > 3,
        subscriptionStatus: 'free'
      }
    })
    
  } catch (error) {
    console.error('加载行动卡失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器错误'
    }, { status: 500 })
  }
}