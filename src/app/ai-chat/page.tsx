'use client'

import { useState, useEffect, useRef } from 'react'
import { AppLayout } from '@/components/layout'
import { Button, Card, Spinner } from '@/components/ui'
import { IconSend, IconAI, IconTrash, IconAlertCircle } from '@/components/icons'
import { FadeIn, SlideIn, Typewriter } from '@/components/animations'
import {
  ChatMessage,
  ConversationContext,
  buildConversationContext,
  createAIRequest,
  parseAIResponse,
  saveConversation,
  loadConversation,
  clearConversation,
  generateQuickQuestions
} from '@/lib/ai-chat'
import { buildRAGContext } from '@/lib/knowledge-base'

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState<ConversationContext | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 加载用户数据和会话
    const userData = localStorage.getItem('petmate_user')
    const saved = userData ? JSON.parse(userData) : {}
    
    const userId = saved.id || 'guest'
    const savedContext = loadConversation(userId)
    
    if (savedContext) {
      setContext(savedContext)
      setMessages(savedContext.messages)
    } else {
      const newContext: ConversationContext = {
        messages: [],
        userProfile: {
          dayNumber: saved.dayNumber || 1,
          phase: getPhase(saved.dayNumber || 1),
          catName: saved.catName,
          catBreed: saved.catBreed,
          catAge: saved.catAge,
          experience: saved.experience
        },
        lastActiveAt: new Date().toISOString()
      }
      setContext(newContext)
    }
  }, [])

  useEffect(() => {
    // 滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getPhase = (day: number) => {
    if (day <= 7) return 'adapt'
    if (day <= 30) return 'explore'
    if (day <= 60) return 'bond'
    return 'stable'
  }

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading || !context) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      metadata: {
        dayNumber: context.userProfile.dayNumber,
        phase: context.userProfile.phase
      }
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // 构建RAG上下文
      const ragContext = buildRAGContext(messageText)
      
      // 构建对话上下文
      const updatedContext: ConversationContext = {
        ...context,
        messages: [...messages, userMessage]
      }
      const aiMessages = buildConversationContext(updatedContext)
      
      // 如果有RAG上下文，添加到系统提示后面
      if (ragContext) {
        const systemMsg = aiMessages.find(m => m.role === 'system')
        if (systemMsg) {
          systemMsg.content += `\n\n${ragContext}`
        }
      }

      // 发送请求
      const response = await createAIRequest(aiMessages)
      const data = await response.json()

      if (data.success) {
        const parsed = parseAIResponse(data.data.answer)
        
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai`,
          role: 'assistant',
          content: parsed.content,
          timestamp: new Date().toISOString(),
          references: parsed.references
        }

        setMessages(prev => [...prev, assistantMessage])
        
        // 保存会话
        const finalContext: ConversationContext = {
          ...updatedContext,
          messages: [...updatedContext.messages, assistantMessage],
          lastActiveAt: new Date().toISOString()
        }
        setContext(finalContext)
        saveConversation(context.userProfile.dayNumber.toString(), finalContext)
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: '抱歉，网络出现问题，请稍后再试。',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleClear = () => {
    if (context) {
      clearConversation(context.userProfile.dayNumber.toString())
      setMessages([])
      setContext({
        ...context,
        messages: [],
        lastActiveAt: new Date().toISOString()
      })
    }
  }

  const quickQuestions = context ? generateQuickQuestions(context) : [
    '猫咪躲着不出来怎么办？',
    '猫咪多久能适应新家？',
    '新猫到家要注意什么？'
  ]

  return (
    <AppLayout title="AI问答">
      <FadeIn>
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconAI className="w-5 h-5 text-orange-500" />
            <span className="font-bold">AI养猫顾问</span>
          </div>
          {messages.length > 0 && (
            <Button size="sm" variant="ghost" onClick={handleClear}>
              <IconTrash className="w-4 h-4" />
              清空
            </Button>
          )}
        </div>

        {/* 介绍卡片 */}
        {messages.length === 0 && (
          <SlideIn direction="up">
            <Card className="mb-6 bg-gradient-to-r from-orange-50 to-purple-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <IconAI className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">你好！我是AI养猫顾问</p>
                  <p className="text-sm text-gray-500">
                    {context?.userProfile.dayNumber ? `Day ${context.userProfile.dayNumber}` : '准备为您服务'}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                我可以帮你解答养猫过程中的各种问题，从健康到行为，从营养到用品。
                有任何疑问都可以问我！
              </p>
              
              {/* 快捷问题 */}
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map(q => (
                  <Button
                    key={q}
                    size="sm"
                    variant="outline"
                    onClick={() => sendMessage(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </Card>
          </SlideIn>
        )}

        {/* 消息列表 */}
        <div className="space-y-4 mb-4">
          {messages.map((msg, i) => (
            <SlideIn key={msg.id} direction={msg.role === 'user' ? 'right' : 'left'} delay={i * 50}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  {/* 紧急提醒 */}
                  {msg.role === 'assistant' && msg.content.includes('⚠') && (
                    <div className="flex items-center gap-2 mb-2 text-red-500 font-bold">
                      <IconAlertCircle className="w-4 h-4" />
                      紧急提醒
                    </div>
                  )}
                  
                  {/* 内容 */}
                  {msg.role === 'assistant' && i === messages.length - 1 && !loading ? (
                    <Typewriter text={msg.content} speed={20} className="text-gray-700" />
                  ) : (
                    <p className={msg.role === 'user' ? '' : 'text-gray-700'}>
                      {msg.content}
                    </p>
                  )}
                  
                  {/* 引用来源 */}
                  {msg.references && msg.references.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        参考：{msg.references.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  {/* 时间 */}
                  <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </SlideIn>
          ))}
          
          {/* 加载动画 */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-sm">
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-gray-500">思考中...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="fixed bottom-16 left-0 right-0 px-4 bg-white border-t border-gray-200">
          <div className="max-w-5xl mx-auto py-3 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="输入你的问题..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="rounded-full"
            >
              <IconSend className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </FadeIn>
    </AppLayout>
  )
}