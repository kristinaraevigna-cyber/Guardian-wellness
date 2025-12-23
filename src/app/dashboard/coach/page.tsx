'use client'

import { useState, useRef, useEffect } from 'react'
import { VoiceChat } from '@/components/coach/VoiceChat'
import { MessageSquare, Mic, Send, Loader2, Bot, User, ChevronDown } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number // Use number instead of Date for serialization
}

type ChatMode = 'text' | 'voice'

export default function CoachPage() {
  const [mode, setMode] = useState<ChatMode>('text')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize on client only to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
    setMessages([
      {
        role: 'assistant',
        content: "Welcome back, Officer. I'm GUARDIAN, your wellness coach. Whether you've just finished a shift, need to decompress, or want to work on your wellbeing goals, I'm here to help. How are you feeling today?",
        timestamp: Date.now(),
      }
    ])
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickPrompts = [
    "I had a difficult call today",
    "Help me with tactical breathing",
    "I'm having trouble sleeping",
    "I need to decompress after shift",
    "I'm feeling burned out",
  ]

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = { 
      role: 'user', 
      content,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        timestamp: Date.now(),
      }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  // Handle voice transcripts
  const handleVoiceTranscript = (text: string, role: 'user' | 'assistant') => {
    setMessages(prev => [...prev, {
      role,
      content: text,
      timestamp: Date.now(),
    }])
  }

  const startNewSession = () => {
    setMessages([{
      role: 'assistant',
      content: "Welcome back. I'm here as your thinking partner. What would you like to focus on today?",
      timestamp: Date.now(),
    }])
  }

  // Show loading state until client is ready
  if (!isClient) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col">
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-tactical-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-600/20 border border-accent-500/30 flex items-center justify-center">
              <span className="text-xl">◈</span>
            </div>
            <div>
              <h2 className="font-semibold text-tactical-100">GUARDIAN Coach</h2>
              <p className="text-xs text-tactical-400">ICF-Aligned • Confidential • Multilingual</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <div className="flex items-center bg-tactical-800 rounded-lg p-1">
              <button
                onClick={() => setMode('text')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  mode === 'text'
                    ? 'bg-accent-600/20 text-accent-400'
                    : 'text-tactical-400 hover:text-tactical-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Text
              </button>
              <button
                onClick={() => setMode('voice')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  mode === 'voice'
                    ? 'bg-accent-600/20 text-accent-400'
                    : 'text-tactical-400 hover:text-tactical-200'
                }`}
              >
                <Mic className="w-4 h-4" />
                Voice
              </button>
            </div>

            <button 
              onClick={startNewSession}
              className="px-3 py-1.5 text-xs bg-tactical-800 hover:bg-tactical-700 text-tactical-300 rounded-lg transition-colors"
            >
              New Session
            </button>
          </div>
        </div>

        {/* Content Area */}
        {mode === 'voice' ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <VoiceChat onTranscript={handleVoiceTranscript} />
            </div>
            
            {/* Voice transcript history (collapsible) */}
            {messages.length > 1 && (
              <div className="border-t border-tactical-800 max-h-[200px] overflow-y-auto">
                <details className="group">
                  <summary className="flex items-center gap-2 p-3 cursor-pointer text-tactical-400 hover:text-tactical-300 text-sm">
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    Conversation Transcript ({messages.length} messages)
                  </summary>
                  <div className="px-4 pb-4 space-y-2">
                    {messages.map((msg, i) => (
                      <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-tactical-300' : 'text-accent-400'}`}>
                        <span className="font-medium">{msg.role === 'user' ? 'You' : 'GUARDIAN'}:</span>{' '}
                        <span className="text-tactical-400">{msg.content}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Text Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-accent-600/20 border border-accent-500/30 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-accent-400" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-accent-600 text-white' 
                      : 'bg-tactical-800 text-tactical-200'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.timestamp && (
                      <p className={`text-xs mt-1 ${
                        msg.role === 'user' ? 'text-accent-200/60' : 'text-tactical-500'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-tactical-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-tactical-300" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-accent-600/20 border border-accent-500/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-accent-400" />
                  </div>
                  <div className="bg-tactical-800 rounded-xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-accent-400" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-tactical-500 mb-2">Quick start:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="px-3 py-1.5 text-xs bg-tactical-800 hover:bg-tactical-700 text-tactical-300 rounded-full border border-tactical-700 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-tactical-800">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-tactical-800 border border-tactical-700 rounded-lg px-4 py-3 text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-tactical-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
