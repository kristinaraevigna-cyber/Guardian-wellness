'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ClipboardList,
  Sparkles,
  Moon,
  Brain,
  Compass,
  ChevronRight,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Loader2,
  X,
  ArrowRight,
  ArrowLeft,
  BarChart3
} from 'lucide-react'

// ============================================
// ASSESSMENT DEFINITIONS
// ============================================

interface AssessmentDef {
  id: string
  name: string
  shortName: string
  description: string
  citation?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  questions: {
    id: string
    text: string
    category?: string
    reverse?: boolean
  }[]
  scale: {
    min: number
    max: number
    labels: string[]
  }
  interpretation: (score: number, maxPossible: number) => { level: string; message: string; color: string }
}

const ASSESSMENTS: AssessmentDef[] = [
  {
    id: 'perma4',
    name: 'PERMA-4',
    shortName: 'PERMA-4',
    description: 'A brief measure of wellbeing across Positive emotions, Engagement, Relationships, Meaning, and Accomplishment',
    citation: 'Donaldson et al., 2022',
    icon: Sparkles,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    scale: {
      min: 0,
      max: 10,
      labels: ['Never', '', '', '', '', 'Sometimes', '', '', '', '', 'Always']
    },
    questions: [
      { id: 'p', text: 'How often do you feel positive emotions (e.g., joy, contentment, love)?', category: 'Positive Emotion' },
      { id: 'e', text: 'How often do you become fully absorbed in activities you find challenging and interesting?', category: 'Engagement' },
      { id: 'r', text: 'How often do you feel supported and cared for by others?', category: 'Relationships' },
      { id: 'm', text: 'How often do you feel that your life has a clear sense of purpose or meaning?', category: 'Meaning' },
      { id: 'a', text: 'How often do you feel a sense of accomplishment from what you do?', category: 'Accomplishment' },
    ],
    interpretation: (score: number, maxPossible: number) => {
      const percent = (score / maxPossible) * 100
      if (percent >= 80) return { level: 'Flourishing', message: 'You are thriving! Your wellbeing is excellent across all dimensions.', color: 'text-green-400' }
      if (percent >= 60) return { level: 'Doing Well', message: 'You have solid wellbeing. Consider which areas you might want to strengthen.', color: 'text-lime-400' }
      if (percent >= 40) return { level: 'Moderate', message: 'There are opportunities to enhance your wellbeing in several areas.', color: 'text-yellow-400' }
      return { level: 'Needs Attention', message: 'Consider focusing on the PERMA elements that matter most to you.', color: 'text-orange-400' }
    }
  },
  {
    id: 'claremont',
    name: 'Claremont Purpose Scale',
    shortName: 'Purpose',
    description: 'Measure your sense of purpose - having meaningful goals and a sense of direction in life',
    citation: 'Bronk et al., 2018',
    icon: Compass,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    scale: {
      min: 1,
      max: 5,
      labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    questions: [
      { id: 'c1', text: 'I have a purpose in my life.', category: 'Purpose Identification' },
      { id: 'c2', text: 'I have a good sense of what I am trying to accomplish in life.', category: 'Purpose Identification' },
      { id: 'c3', text: 'I know what my life goals are.', category: 'Purpose Identification' },
      { id: 'c4', text: 'I have certain life goals that compel me to keep going.', category: 'Motivation' },
      { id: 'c5', text: 'I am motivated to pursue my purpose.', category: 'Motivation' },
      { id: 'c6', text: 'I am driven to pursue my purpose.', category: 'Motivation' },
      { id: 'c7', text: 'I am actively working to achieve my life purpose.', category: 'Engagement' },
      { id: 'c8', text: 'I am actively involved in achieving my purpose.', category: 'Engagement' },
      { id: 'c9', text: 'I take action toward my purpose every day.', category: 'Engagement' },
      { id: 'c10', text: 'My purpose makes a positive difference in the world.', category: 'Beyond-the-Self' },
      { id: 'c11', text: 'My purpose benefits society.', category: 'Beyond-the-Self' },
      { id: 'c12', text: 'My purpose contributes positively to the world.', category: 'Beyond-the-Self' },
    ],
    interpretation: (score: number, maxPossible: number) => {
      const percent = (score / maxPossible) * 100
      if (percent >= 80) return { level: 'Strong Purpose', message: 'You have a clear, meaningful purpose that guides your life!', color: 'text-green-400' }
      if (percent >= 60) return { level: 'Developing Purpose', message: 'You are building a sense of purpose. Keep exploring what matters to you.', color: 'text-lime-400' }
      if (percent >= 40) return { level: 'Searching', message: 'You may be in a period of exploration. This is a natural part of finding purpose.', color: 'text-yellow-400' }
      return { level: 'Seeking Direction', message: 'Consider reflecting on what gives your life meaning and direction.', color: 'text-orange-400' }
    }
  },
  {
    id: 'sleep',
    name: 'Sleep Quality Assessment',
    shortName: 'Sleep',
    description: 'Evaluate your sleep patterns, quality, and daytime functioning over the past week',
    icon: Moon,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    scale: {
      min: 0,
      max: 4,
      labels: ['Not at all', 'A little', 'Moderately', 'Quite a bit', 'Extremely']
    },
    questions: [
      { id: 's1', text: 'How satisfied are you with your overall sleep quality this past week?', category: 'Quality' },
      { id: 's2', text: 'How easily have you been able to fall asleep?', category: 'Sleep Onset' },
      { id: 's3', text: 'How well have you been able to stay asleep through the night?', category: 'Sleep Maintenance' },
      { id: 's4', text: 'How refreshed do you feel when you wake up in the morning?', category: 'Restfulness' },
      { id: 's5', text: 'How consistent has your sleep schedule been (going to bed and waking at similar times)?', category: 'Consistency' },
      { id: 's6', text: 'How alert and energized do you feel during the day?', category: 'Daytime Functioning' },
      { id: 's7', text: 'How well does your sleep support your overall wellbeing?', category: 'Overall' },
    ],
    interpretation: (score: number, maxPossible: number) => {
      const percent = (score / maxPossible) * 100
      if (percent >= 80) return { level: 'Excellent', message: 'Your sleep quality is excellent! Keep maintaining these healthy habits.', color: 'text-green-400' }
      if (percent >= 60) return { level: 'Good', message: 'Your sleep is generally good. Minor adjustments could optimize your rest.', color: 'text-lime-400' }
      if (percent >= 40) return { level: 'Fair', message: 'Your sleep could be improved. Consider your sleep environment and routine.', color: 'text-yellow-400' }
      return { level: 'Needs Attention', message: 'Your sleep may be impacting your wellbeing. Consider speaking with a professional.', color: 'text-orange-400' }
    }
  },
  {
    id: 'psycap',
    name: 'Psychological Capital (HERO)',
    shortName: 'PsyCap',
    description: 'Measure your psychological resources: Hope, Efficacy, Resilience, and Optimism',
    citation: 'Luthans et al., 2007',
    icon: Brain,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    scale: {
      min: 1,
      max: 6,
      labels: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Somewhat Agree', 'Agree', 'Strongly Agree']
    },
    questions: [
      // Hope
      { id: 'h1', text: 'I can think of many ways to reach my current goals.', category: 'Hope' },
      { id: 'h2', text: 'I energetically pursue my goals.', category: 'Hope' },
      { id: 'h3', text: 'There are lots of ways around any problem.', category: 'Hope' },
      // Efficacy
      { id: 'ef1', text: 'I feel confident analyzing a long-term problem to find a solution.', category: 'Efficacy' },
      { id: 'ef2', text: 'I feel confident presenting information to a group.', category: 'Efficacy' },
      { id: 'ef3', text: 'I feel confident contributing to discussions about strategy.', category: 'Efficacy' },
      // Resilience
      { id: 're1', text: 'I can get through difficult times because I have experienced difficulty before.', category: 'Resilience' },
      { id: 're2', text: 'I usually take stressful things in stride.', category: 'Resilience' },
      { id: 're3', text: 'I can handle setbacks and challenges when they arise.', category: 'Resilience' },
      // Optimism
      { id: 'o1', text: 'I always look on the bright side of things.', category: 'Optimism' },
      { id: 'o2', text: 'I am optimistic about what will happen to me in the future.', category: 'Optimism' },
      { id: 'o3', text: 'I approach challenges expecting good outcomes.', category: 'Optimism' },
    ],
    interpretation: (score: number, maxPossible: number) => {
      const percent = (score / maxPossible) * 100
      if (percent >= 80) return { level: 'High PsyCap', message: 'You have excellent psychological resources to draw from!', color: 'text-green-400' }
      if (percent >= 60) return { level: 'Good PsyCap', message: 'You have solid psychological capital. Consider which HERO trait to develop further.', color: 'text-lime-400' }
      if (percent >= 40) return { level: 'Moderate PsyCap', message: 'Building your HERO traits could boost your overall resilience and wellbeing.', color: 'text-yellow-400' }
      return { level: 'Developing PsyCap', message: 'Focus on building hope, efficacy, resilience, and optimism through daily practices.', color: 'text-orange-400' }
    }
  }
]

// ============================================
// COMPONENT
// ============================================

interface AssessmentResponse {
  id: string
  user_id: string
  assessment_type: string
  responses: Record<string, number>
  total_score: number
  category_scores: Record<string, number>
  created_at: string
}

export default function AssessmentsPage() {
  const [completedAssessments, setCompletedAssessments] = useState<AssessmentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeAssessment, setActiveAssessment] = useState<AssessmentDef | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [latestResult, setLatestResult] = useState<{ totalScore: number; categoryScores: Record<string, number>; maxPossible: number } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setIsClient(true)
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCompletedAssessments(data || [])
    } catch (error) {
      console.error('Error fetching assessments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startAssessment = (assessment: AssessmentDef) => {
    setActiveAssessment(assessment)
    setCurrentQuestion(0)
    setResponses({})
    setShowResults(false)
    setLatestResult(null)
  }

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const nextQuestion = () => {
    if (activeAssessment && currentQuestion < activeAssessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const calculateResults = () => {
    if (!activeAssessment) return null

    const categoryScores: Record<string, { total: number; count: number }> = {}
    
    activeAssessment.questions.forEach(q => {
      const category = q.category || 'General'
      if (!categoryScores[category]) {
        categoryScores[category] = { total: 0, count: 0 }
      }
      if (responses[q.id] !== undefined) {
        categoryScores[category].total += responses[q.id]
        categoryScores[category].count += 1
      }
    })

    const finalCategoryScores: Record<string, number> = {}
    Object.entries(categoryScores).forEach(([cat, { total, count }]) => {
      finalCategoryScores[cat] = count > 0 ? Number((total / count).toFixed(2)) : 0
    })

    const allValues = Object.values(responses)
    const totalScore = allValues.length > 0 
      ? Number(allValues.reduce((a, b) => a + b, 0).toFixed(2))
      : 0

    const maxPossible = activeAssessment.questions.length * activeAssessment.scale.max

    return {
      totalScore,
      categoryScores: finalCategoryScores,
      maxPossible
    }
  }

  const submitAssessment = async () => {
    if (!activeAssessment) return
    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const results = calculateResults()
      if (!results) throw new Error('Could not calculate results')

      const assessmentData = {
        user_id: user.id,
        assessment_type: activeAssessment.id,
        responses,
        total_score: results.totalScore,
        category_scores: results.categoryScores,
      }

      const { error } = await supabase
        .from('assessment_responses')
        .insert([assessmentData])

      if (error) throw error

      setLatestResult(results)
      setShowResults(true)
      fetchAssessments()
    } catch (error) {
      console.error('Error saving assessment:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const closeAssessment = () => {
    setActiveAssessment(null)
    setCurrentQuestion(0)
    setResponses({})
    setShowResults(false)
    setLatestResult(null)
  }

  const getLastCompleted = (assessmentId: string) => {
    return completedAssessments.find(a => a.assessment_type === assessmentId)
  }

  const getCompletionCount = (assessmentId: string) => {
    return completedAssessments.filter(a => a.assessment_type === assessmentId).length
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
      </div>
    )
  }

  // Active Assessment View
  if (activeAssessment) {
    const currentQ = activeAssessment.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / activeAssessment.questions.length) * 100
    const isLastQuestion = currentQuestion === activeAssessment.questions.length - 1
    const canProceed = responses[currentQ.id] !== undefined

    // Results View
    if (showResults && latestResult) {
      const interpretation = activeAssessment.interpretation(latestResult.totalScore, latestResult.maxPossible)
      
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-tactical-800 text-center">
              <div className={`w-16 h-16 rounded-2xl ${activeAssessment.bgColor} flex items-center justify-center mx-auto mb-4`}>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-tactical-100 mb-1">Assessment Complete!</h2>
              <p className="text-tactical-400">{activeAssessment.name}</p>
            </div>

            {/* Score */}
            <div className="p-6 border-b border-tactical-800">
              <div className="text-center mb-6">
                <p className="text-sm text-tactical-400 mb-1">Your Score</p>
                <p className="text-4xl font-bold text-tactical-100">
                  {latestResult.totalScore} <span className="text-lg text-tactical-500">/ {latestResult.maxPossible}</span>
                </p>
                <p className={`text-lg font-medium mt-2 ${interpretation.color}`}>
                  {interpretation.level}
                </p>
                <p className="text-sm text-tactical-400 mt-1">{interpretation.message}</p>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-tactical-300 mb-3">Category Breakdown</h3>
                {Object.entries(latestResult.categoryScores).map(([category, score]) => {
                  const maxForCategory = activeAssessment.scale.max
                  const percent = (score / maxForCategory) * 100
                  
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-tactical-300">{category}</span>
                        <span className="text-tactical-400">{score.toFixed(1)} / {maxForCategory}</span>
                      </div>
                      <div className="h-2 bg-tactical-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent >= 80 ? 'bg-green-500' :
                            percent >= 60 ? 'bg-lime-500' :
                            percent >= 40 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6">
              <button
                onClick={closeAssessment}
                className="w-full px-4 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Question View
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-tactical-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeAssessment.bgColor}`}>
                  <activeAssessment.icon className={`w-5 h-5 ${activeAssessment.color}`} />
                </div>
                <div>
                  <h2 className="font-semibold text-tactical-100">{activeAssessment.name}</h2>
                  <p className="text-xs text-tactical-500">Question {currentQuestion + 1} of {activeAssessment.questions.length}</p>
                </div>
              </div>
              <button
                onClick={closeAssessment}
                className="p-2 hover:bg-tactical-800 rounded-lg transition-colors text-tactical-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="h-1.5 bg-tactical-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="p-6">
            {currentQ.category && (
              <span className="text-xs text-tactical-500 uppercase tracking-wider">{currentQ.category}</span>
            )}
            <p className="text-lg text-tactical-100 mt-2 mb-8">{currentQ.text}</p>

            {/* Scale */}
            <div className="space-y-3">
              {activeAssessment.scale.labels.map((label, index) => {
                const value = activeAssessment.scale.min + index
                if (!label && index !== 0 && index !== activeAssessment.scale.labels.length - 1) {
                  // Skip empty labels in the middle for cleaner UI on 0-10 scales
                  if (activeAssessment.scale.max > 6) return null
                }
                const isSelected = responses[currentQ.id] === value
                
                return (
                  <button
                    key={value}
                    onClick={() => handleResponse(currentQ.id, value)}
                    className={`w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-accent-600/20 border-accent-500 text-accent-400'
                        : 'bg-tactical-800/50 border-tactical-700 text-tactical-300 hover:border-tactical-600'
                    }`}
                  >
                    <span>{label || `${value}`}</span>
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-accent-500 bg-accent-500' : 'border-tactical-600'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </span>
                  </button>
                )
              }).filter(Boolean)}
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-t border-tactical-800 flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2 bg-tactical-800 hover:bg-tactical-700 disabled:opacity-50 disabled:cursor-not-allowed text-tactical-300 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            
            {isLastQuestion ? (
              <button
                onClick={submitAssessment}
                disabled={!canProceed || isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-tactical-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={!canProceed}
                className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-tactical-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main View - Assessment List
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-tactical-100">Assessments</h1>
        <p className="text-tactical-400 text-sm">Track your wellbeing with validated measures</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4 text-center">
          <p className="text-2xl font-bold text-tactical-100">{completedAssessments.length}</p>
          <p className="text-xs text-tactical-400">Total Completed</p>
        </div>
        {ASSESSMENTS.slice(0, 3).map(assessment => (
          <div key={assessment.id} className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4 text-center">
            <p className="text-2xl font-bold text-tactical-100">{getCompletionCount(assessment.id)}</p>
            <p className="text-xs text-tactical-400">{assessment.shortName}</p>
          </div>
        ))}
      </div>

      {/* Assessment Cards */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
          </div>
        ) : (
          ASSESSMENTS.map((assessment) => {
            const lastCompleted = getLastCompleted(assessment.id)
            const Icon = assessment.icon
            
            return (
              <div
                key={assessment.id}
                className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-5 hover:border-tactical-700 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${assessment.bgColor}`}>
                    <Icon className={`w-6 h-6 ${assessment.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-tactical-100 mb-1">{assessment.name}</h3>
                        <p className="text-sm text-tactical-400 mb-2">{assessment.description}</p>
                        {assessment.citation && (
                          <p className="text-xs text-tactical-500">{assessment.citation}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => startAssessment(assessment)}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-600/20 hover:bg-accent-600/30 text-accent-400 rounded-lg transition-colors flex-shrink-0"
                      >
                        <ClipboardList className="w-4 h-4" />
                        {lastCompleted ? 'Retake' : 'Start'}
                      </button>
                    </div>
                    
                    {/* Last Result */}
                    {lastCompleted && (
                      <div className="mt-4 pt-4 border-t border-tactical-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs text-tactical-500">Last Score</p>
                              <p className="text-lg font-semibold text-tactical-100">
                                {lastCompleted.total_score}
                              </p>
                            </div>
                            <div className="text-xs text-tactical-500">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {formatDate(lastCompleted.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-tactical-500">
                            <BarChart3 className="w-3.5 h-3.5" />
                            {getCompletionCount(assessment.id)} completions
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
