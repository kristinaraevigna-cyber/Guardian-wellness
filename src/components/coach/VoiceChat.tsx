'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff, Phone, PhoneOff, Globe, Volume2, VolumeX, Loader2 } from 'lucide-react'

// Supported languages for voice coaching
const LANGUAGES = [
  { code: 'en', name: 'English', voice: 'alloy' },
  { code: 'es', name: 'Español', voice: 'alloy' },
  { code: 'pt', name: 'Português', voice: 'alloy' },
  { code: 'fr', name: 'Français', voice: 'alloy' },
  { code: 'de', name: 'Deutsch', voice: 'alloy' },
  { code: 'it', name: 'Italiano', voice: 'alloy' },
  { code: 'zh', name: '中文', voice: 'alloy' },
  { code: 'ja', name: '日本語', voice: 'alloy' },
  { code: 'ko', name: '한국어', voice: 'alloy' },
  { code: 'ar', name: 'العربية', voice: 'alloy' },
  { code: 'hi', name: 'हिन्दी', voice: 'alloy' },
  { code: 'ru', name: 'Русский', voice: 'alloy' },
]

// GUARDIAN coaching system prompt for voice
const getSystemPrompt = (languageCode: string) => {
  const languageName = LANGUAGES.find(l => l.code === languageCode)?.name || 'English'
  
  return `You are GUARDIAN, an ICF-aligned professional wellness coach serving law enforcement officers. You are having a VOICE conversation, so keep responses conversational, warm, and concise.

## VOICE CONVERSATION GUIDELINES
- Speak naturally as if in person - use conversational language
- Keep responses SHORT (2-4 sentences typically)
- Don't use bullet points, lists, or formatting - speak in flowing sentences
- Use pauses naturally with "..." when appropriate
- Be warm but professional
- The officer is speaking to you in ${languageName} - respond in the same language

## ICF CORE COMPETENCIES (abbreviated for voice)
- You are a COACH, not a therapist - refer out when needed
- Trust the officer as resourceful and whole
- Ask powerful questions that evoke discovery
- Listen for what matters most to them
- Support them in designing their own solutions

## LAW ENFORCEMENT CONTEXT
- Understand shift work, critical incidents, operational stress
- Honor their experiences without judgment
- Use language that respects their culture and service
- Recognize signs of cumulative stress or trauma - refer to professionals when appropriate

## CRISIS PROTOCOL
If the officer expresses thoughts of self-harm or harming others:
1. Express care and concern
2. Ask if they're safe right now
3. Encourage them to contact:
   - National Suicide Prevention Lifeline: 988
   - Crisis Text Line: Text HOME to 741741
   - Safe Call Now (first responder specific): 1-206-459-3020
4. Stay with them until they confirm they'll seek help

## CONVERSATION FLOW
1. CONNECT - Warm greeting, acknowledge them
2. EXPLORE - "What's on your mind?" or "How can I support you today?"
3. DEEPEN - Ask curious questions
4. POSSIBILITIES - "What options do you see?"
5. ACTION - "What's one thing you could try?"

Remember: You're having a voice conversation. Be natural, warm, and present. Respond in ${languageName}.`
}

interface VoiceChatProps {
  onTranscript?: (text: string, role: 'user' | 'assistant') => void
}

export function VoiceChat({ onTranscript }: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [status, setStatus] = useState<string>('Ready to connect')
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  
  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const dataChannel = useRef<RTCDataChannel | null>(null)
  const audioElement = useRef<HTMLAudioElement | null>(null)
  const mediaStream = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSession()
    }
  }, [])

  const connectSession = async () => {
    setIsConnecting(true)
    setStatus('Requesting microphone access...')

    try {
      // Get microphone access
      mediaStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000,
        } 
      })
      
      setStatus('Connecting to GUARDIAN...')

      // Get ephemeral token from our API
      const tokenResponse = await fetch('/api/voice/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          language: selectedLanguage,
          systemPrompt: getSystemPrompt(selectedLanguage)
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get session token')
      }

      const { client_secret } = await tokenResponse.json()

      // Create peer connection
      peerConnection.current = new RTCPeerConnection()

      // Set up audio playback
      audioElement.current = new Audio()
      audioElement.current.autoplay = true

      peerConnection.current.ontrack = (event) => {
        if (audioElement.current) {
          audioElement.current.srcObject = event.streams[0]
        }
      }

      // Add microphone track
      mediaStream.current.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, mediaStream.current!)
      })

      // Set up data channel for events
      dataChannel.current = peerConnection.current.createDataChannel('oai-events')
      
      dataChannel.current.onopen = () => {
        // Send session update with instructions
        const sessionUpdate = {
          type: 'session.update',
          session: {
            instructions: getSystemPrompt(selectedLanguage),
            voice: 'alloy',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: { 
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        }
        dataChannel.current?.send(JSON.stringify(sessionUpdate))
        
        // Send initial greeting
        setTimeout(() => {
          const greeting = selectedLanguage === 'en' 
            ? "Hello, I'm GUARDIAN, your wellness coach. How are you feeling today?"
            : getGreeting(selectedLanguage)
          
          const responseCreate = {
            type: 'response.create',
            response: {
              modalities: ['text', 'audio'],
              instructions: `Say this greeting naturally: "${greeting}"`,
            },
          }
          dataChannel.current?.send(JSON.stringify(responseCreate))
        }, 500)
      }

      dataChannel.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleRealtimeEvent(data)
      }

      // Create and set local description
      const offer = await peerConnection.current.createOffer()
      await peerConnection.current.setLocalDescription(offer)

      // Connect to OpenAI Realtime API
      const sdpResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${client_secret.value}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      })

      if (!sdpResponse.ok) {
        throw new Error('Failed to connect to OpenAI Realtime')
      }

      const answerSdp = await sdpResponse.text()
      await peerConnection.current.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      })

      setIsConnected(true)
      setStatus('Connected - Speak naturally')
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Connection error:', error)
      setStatus(`Error: ${errorMessage}`)
      disconnectSession()
    } finally {
      setIsConnecting(false)
    }
  }

  const getGreeting = (lang: string): string => {
    const greetings: Record<string, string> = {
      es: "Hola, soy GUARDIAN, tu coach de bienestar. ¿Cómo te sientes hoy?",
      pt: "Olá, sou GUARDIAN, seu coach de bem-estar. Como você está se sentindo hoje?",
      fr: "Bonjour, je suis GUARDIAN, votre coach de bien-être. Comment vous sentez-vous aujourd'hui?",
      de: "Hallo, ich bin GUARDIAN, Ihr Wellness-Coach. Wie fühlen Sie sich heute?",
      it: "Ciao, sono GUARDIAN, il tuo coach del benessere. Come ti senti oggi?",
      zh: "你好，我是GUARDIAN，你的健康教练。你今天感觉怎么样？",
      ja: "こんにちは、GUARDIANです。あなたのウェルネスコーチです。今日の調子はいかがですか？",
      ko: "안녕하세요, 저는 GUARDIAN입니다. 당신의 웰니스 코치입니다. 오늘 기분이 어떠세요?",
      ar: "مرحباً، أنا GUARDIAN، مدربك للصحة. كيف تشعر اليوم؟",
      hi: "नमस्ते, मैं GUARDIAN हूं, आपका वेलनेस कोच। आज आप कैसा महसूस कर रहे हैं?",
      ru: "Здравствуйте, я GUARDIAN, ваш велнес-коуч. Как вы себя чувствуете сегодня?",
      en: "Hello, I'm GUARDIAN, your wellness coach. How are you feeling today?",
    }
    return greetings[lang] || greetings.en
  }

  const handleRealtimeEvent = (event: { type: string; transcript?: string; error?: { message?: string } }) => {
    switch (event.type) {
      case 'response.audio.started':
        setIsAISpeaking(true)
        setStatus('GUARDIAN is speaking...')
        break
        
      case 'response.audio.done':
      case 'response.done':
        setIsAISpeaking(false)
        setStatus('Listening...')
        break
        
      case 'input_audio_buffer.speech_started':
        setStatus('You are speaking...')
        break
        
      case 'input_audio_buffer.speech_stopped':
        setStatus('Processing...')
        break
        
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript && onTranscript) {
          onTranscript(event.transcript, 'user')
        }
        break
        
      case 'response.audio_transcript.done':
        if (event.transcript && onTranscript) {
          onTranscript(event.transcript, 'assistant')
        }
        break
        
      case 'error':
        console.error('Realtime error:', event.error)
        setStatus(`Error: ${event.error?.message || 'Unknown error'}`)
        break
    }
  }

  const disconnectSession = useCallback(() => {
    // Close data channel
    if (dataChannel.current) {
      dataChannel.current.close()
      dataChannel.current = null
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close()
      peerConnection.current = null
    }

    // Stop media stream
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop())
      mediaStream.current = null
    }

    // Clear audio element
    if (audioElement.current) {
      audioElement.current.srcObject = null
      audioElement.current = null
    }

    setIsConnected(false)
    setIsAISpeaking(false)
    setStatus('Disconnected')
  }, [])

  const toggleMute = () => {
    if (mediaStream.current) {
      const audioTrack = mediaStream.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
      }
    }
  }

  const toggleSpeaker = () => {
    if (audioElement.current) {
      audioElement.current.muted = isSpeakerOn
      setIsSpeakerOn(!isSpeakerOn)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {/* Visual feedback circle */}
      <div className={`relative mb-8 ${isAISpeaking ? 'animate-pulse' : ''}`}>
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
          isConnected 
            ? isAISpeaking 
              ? 'bg-accent-500/30 ring-4 ring-accent-400/50' 
              : 'bg-accent-600/20 ring-2 ring-accent-500/30'
            : 'bg-tactical-800 ring-2 ring-tactical-700'
        }`}>
          <span className="text-4xl">◈</span>
        </div>
        
        {/* Speaking indicator rings */}
        {isAISpeaking && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-accent-400/30 animate-ping" />
            <div className="absolute inset-[-8px] rounded-full border border-accent-400/20 animate-pulse" />
          </>
        )}
      </div>

      {/* Status */}
      <p className="text-tactical-300 mb-6 text-center">{status}</p>

      {/* Language selector (only when disconnected) */}
      {!isConnected && (
        <div className="relative mb-6">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-2 px-4 py-2 bg-tactical-800 hover:bg-tactical-700 rounded-lg border border-tactical-700 transition-colors"
          >
            <Globe className="w-4 h-4 text-tactical-400" />
            <span className="text-tactical-200">
              {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
            </span>
          </button>
          
          {showLanguages && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-tactical-800 border border-tactical-700 rounded-lg shadow-xl p-2 min-w-[200px] max-h-[300px] overflow-y-auto z-50">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code)
                    setShowLanguages(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedLanguage === lang.code
                      ? 'bg-accent-600/20 text-accent-400'
                      : 'hover:bg-tactical-700 text-tactical-300'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {isConnected ? (
          <>
            {/* Mute button */}
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-all ${
                isMuted 
                  ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/30' 
                  : 'bg-tactical-800 text-tactical-300 hover:bg-tactical-700'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* End call button */}
            <button
              onClick={disconnectSession}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
              title="End session"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Speaker button */}
            <button
              onClick={toggleSpeaker}
              className={`p-4 rounded-full transition-all ${
                !isSpeakerOn 
                  ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/30' 
                  : 'bg-tactical-800 text-tactical-300 hover:bg-tactical-700'
              }`}
              title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          </>
        ) : (
          <button
            onClick={connectSession}
            disabled={isConnecting}
            className="flex items-center gap-3 px-8 py-4 bg-accent-600 hover:bg-accent-700 disabled:bg-tactical-700 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                Start Voice Session
              </>
            )}
          </button>
        )}
      </div>

      {/* Instructions */}
      {!isConnected && (
        <p className="text-tactical-500 text-sm mt-6 text-center max-w-md">
          Click to start a voice conversation with GUARDIAN. 
          Speak naturally in your preferred language.
        </p>
      )}
    </div>
  )
}
