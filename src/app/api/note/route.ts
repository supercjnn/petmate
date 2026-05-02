import { NextRequest, NextResponse } from 'next/server'
import { Note } from '@/lib/user-types'
import { 
  supabase, 
  isSupabaseConfigured, 
  getNotes as dbGetNotes, 
  addNote as dbAddNote,
  deleteNote as dbDeleteNote
} from '@/lib/supabase'

// MVP阶段：内存存储作为fallback
const notes: Map<string, Note[]> = new Map() // userId_dayNumber -> notes

// POST: 添加/更新笔记
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, dayNumber, note } = body
    
    if (!userId || !dayNumber) {
      return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 })
    }
    
    // Supabase 模式
    if (isSupabaseConfigured() && supabase) {
      if (note.id) {
        // 更新现有笔记
        const { data: updatedNote, error } = await supabase
          .from('notes')
          .update({ 
            content: note.content,
            type: note.type 
          })
          .eq('id', note.id)
          .select()
          .single()
        
        if (error) {
          console.error('Supabase 更新笔记失败:', error)
          // 降级到内存
          return await handleNoteMemory(userId, dayNumber, note)
        }
        
        // 获取该天所有笔记
        const dayNotes = await dbGetNotes(userId, dayNumber)
        return NextResponse.json({
          success: true,
          data: { notes: dayNotes },
          message: '笔记更新成功（Supabase）'
        })
      } else {
        // 添加新笔记
        const newNote = await dbAddNote(userId, dayNumber, {
          content: note.content,
          type: note.type || 'observation'
        })
        
        if (!newNote) {
          console.error('Supabase 添加笔记失败')
          // 降级到内存
          return await handleNoteMemory(userId, dayNumber, note)
        }
        
        // 获取该天所有笔记
        const dayNotes = await dbGetNotes(userId, dayNumber)
        return NextResponse.json({
          success: true,
          data: { notes: dayNotes },
          message: '笔记保存成功（Supabase）'
        })
      }
    }
    
    // 内存存储模式
    return await handleNoteMemory(userId, dayNumber, note)
  } catch (error) {
    console.error('Note API 错误:', error)
    return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 })
  }
}

// 内存笔记处理
async function handleNoteMemory(userId: string, dayNumber: number, note: any) {
  const key = `${userId}_${dayNumber}`
  const dayNotes = notes.get(key) || []
  
  if (note.id) {
    // 更新现有笔记
    const index = dayNotes.findIndex(n => n.id === note.id)
    if (index >= 0) {
      dayNotes[index] = { ...note, updatedAt: new Date().toISOString() }
    }
  } else {
    // 添加新笔记
    const newNote: Note = {
      id: 'note_' + Date.now().toString(36),
      content: note.content,
      type: note.type || 'observation',
      createdAt: new Date().toISOString()
    }
    dayNotes.push(newNote)
  }
  
  notes.set(key, dayNotes)
  
  return NextResponse.json({
    success: true,
    data: { notes: dayNotes },
    message: '笔记保存成功'
  })
}

// GET: 获取笔记
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const userId = searchParams.get('userId')
  const dayNumber = parseInt(searchParams.get('day') || '0')
  
  if (!userId || !dayNumber) {
    return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 })
  }
  
  // Supabase 模式
  if (isSupabaseConfigured() && supabase) {
    const dayNotes = await dbGetNotes(userId, dayNumber)
    
    // 转换字段名（Supabase 使用 snake_case）
    const formattedNotes = dayNotes.map((n: any) => ({
      id: n.id,
      content: n.content,
      type: n.type,
      createdAt: n.created_at
    }))
    
    return NextResponse.json({
      success: true,
      data: { notes: formattedNotes }
    })
  }
  
  // 内存存储模式
  const key = `${userId}_${dayNumber}`
  const dayNotes = notes.get(key) || []
  
  return NextResponse.json({
    success: true,
    data: { notes: dayNotes }
  })
}

// DELETE: 删除笔记
export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const userId = searchParams.get('userId')
  const dayNumber = parseInt(searchParams.get('day') || '0')
  const noteId = searchParams.get('noteId')
  
  if (!userId || !dayNumber || !noteId) {
    return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 })
  }
  
  // Supabase 模式
  if (isSupabaseConfigured() && supabase) {
    const success = await dbDeleteNote(noteId)
    
    if (!success) {
      console.error('Supabase 删除笔记失败')
      // 降级到内存删除
      const key = `${userId}_${dayNumber}`
      const dayNotes = notes.get(key) || []
      const filtered = dayNotes.filter(n => n.id !== noteId)
      notes.set(key, filtered)
    }
    
    // 获取更新后的笔记列表
    const dayNotes = await dbGetNotes(userId, dayNumber)
    const formattedNotes = dayNotes.map((n: any) => ({
      id: n.id,
      content: n.content,
      type: n.type,
      createdAt: n.created_at
    }))
    
    return NextResponse.json({
      success: true,
      data: { notes: formattedNotes },
      message: '笔记已删除（Supabase）'
    })
  }
  
  // 内存存储模式
  const key = `${userId}_${dayNumber}`
  const dayNotes = notes.get(key) || []
  const filtered = dayNotes.filter(n => n.id !== noteId)
  notes.set(key, filtered)
  
  return NextResponse.json({
    success: true,
    data: { notes: filtered },
    message: '笔记已删除'
  })
}