import { NextRequest, NextResponse } from 'next/server'
import { getBreedList, getBreedSelectionData, BREEDS, getActivityRecommendation, getHealthRiskWarnings } from '@/lib/breed-engine'

// 获取品种列表
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const breedId = searchParams.get('breedId')
  
  // 如果指定了品种ID，返回品种详情
  if (breedId) {
    const breed = BREEDS[breedId]
    if (!breed) {
      return NextResponse.json({
        success: false,
        error: '品种不存在'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        breed,
        activityRecommendation: getActivityRecommendation(breedId),
        healthWarnings: getHealthRiskWarnings(breedId)
      }
    })
  }
  
  // 否则返回品种列表
  return NextResponse.json({
    success: true,
    data: {
      breeds: getBreedList(),
      categories: getBreedSelectionData()
    }
  })
}