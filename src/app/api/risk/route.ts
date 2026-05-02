import { NextRequest, NextResponse } from 'next/server'
import { evaluateRisk, getStage } from '@/lib/engine'
import { CatStatus } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dayNumber, status } = body as { dayNumber: number; status: CatStatus }
    
    if (!status) {
      return NextResponse.json({ success: false, error: 'Missing status' }, { status: 400 })
    }
    
    const result = evaluateRisk(status, dayNumber || 1)
    const stage = getStage(dayNumber || 1)
    
    return NextResponse.json({
      success: true,
      data: { ...result, stage: stage.name, dayNumber: dayNumber || 1 }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to evaluate' }, { status: 500 })
  }
}