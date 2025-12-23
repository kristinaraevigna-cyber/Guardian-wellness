'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Target,
  BookOpen,
  ClipboardList,
  Waves,
  Sparkles,
  Brain,
  MessageSquare,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Flame,
  Award,
  Heart,
  Moon,
  Sun,
  Sunrise,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Play,
  GraduationCap,
  Shield
} from 'lucide-react'

interface DashboardData {
  // User
  userName: string
  
  // Goals
  totalGoals: number
  activeGoals: number
  completedGoals: number
  recentGoals: any[]
  
  // Journal
  totalEntries: number
  weeklyEntries: number
  journalStreak: number
  recentEntries: any[]
  avgMood: number
  
  // Assessments
  totalAssessments: number
  recentAssessments: any[]
  
  // NuCalm
  totalSessions: number
  totalMinutes: number
  avgMoodImprovement: number
  avgStressReduction: number
  recentSessions: any[]
  
  // Interventions
  totalCompletions: number
  weeklyCompletions: number
  totalInterventionMinutes: number
  recentCompletions: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [greeting, setGreeting] = useState('')
  const [isClient, setIsClient] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    setIsClient(true)
    
    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
    
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      // Fetch all data in parallel
      const [
        goalsRes,
        journalRes,
        assessmentsRes,
        nucalmRes,
        interventionsRes,
        profileRes
      ] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('assessment_responses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('nucalm_sessions').select('*').eq('user_id', user.id).order('session_date', { ascending: false }),
        supabase.from('intervention_completions').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }),
        supabase.from('profiles').select('full_name').eq('id', user.id).single()
      ])

      const goals = goalsRes.data || []
      const journal = journalRes.data || []
      const assessments = assessmentsRes.data || []
      const nucalm = nucalmRes.data || []
      const interventions = interventionsRes.data || []

      // Calculate journal streak
      let journalStreak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        
        const hasEntry = journal.some(e => {
          const entryDate = new Date(e.created_at)
          entryDate.setHours(0, 0, 0, 0)
          return entryDate.getTime() === checkDate.getTime()
        })
        
        if (hasEntry) journalStreak++
        else if (i > 0) break
      }

      // Calculate averages
      const avgMood = journal.length > 0
        ? journal.reduce((acc, e) => acc + (e.mood_after || 3), 0) / journal.length
        : 0

      const nucalmWithMood = nucalm.filter(s => s.mood_before && s.mood_after)
      const avgMoodImprovement = nucalmWithMood.length > 0
        ? nucalmWithMood.reduce((acc, s) => acc + (s.mood_after - s.mood_before), 0) / nucalmWithMood.length
        : 0

      const nucalmWithStress = nucalm.filter(s => s.stress_before && s.stress_after)
      const avgStressReduction = nucalmWithStress.length > 0
        ? nucalmWithStress.reduce((acc, s) => acc + (s.stress_before - s.stress_after), 0) / nucalmWithStress.length
        : 0

      // Weekly counts
      const weeklyEntries = journal.filter(e => new Date(e.created_at) >= weekAgo).length
      const weeklyCompletions = interventions.filter(i => new Date(i.completed_at) >= weekAgo).length

      setData({
        userName: profileRes.data?.full_name || user.email?.split('@')[0] || 'Officer',
        
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        recentGoals: goals.slice(0, 3),
        
        totalEntries: journal.length,
        weeklyEntries,
        journalStreak,
        recentEntries: journal.slice(0, 3),
        avgMood,
        
        totalAssessments: assessments.length,
        recentAssessments: assessments.slice(0, 3),
        
        totalSessions: nucalm.length,
        totalMinutes: nucalm.reduce((acc, s) => acc + (s.duration_minutes || 0), 0),
        avgMoodImprovement,
        avgStressReduction,
        recentSessions: nucalm.slice(0, 3),
        
        totalCompletions: interventions.length,
        weeklyCompletions,
        totalInterventionMinutes: Math.round(interventions.reduce((acc, i) => acc + (i.duration_seconds || 0), 0) / 60),
        recentCompletions: interventions.slice(0, 3),
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getTimeIcon = () => {
    const hour = new Date().getHours()
    if (hour < 12) return <Sunrise className="w-6 h-6 text-amber-400" />
    if (hour < 17) return <Sun className="w-6 h-6 text-yellow-400" />
    return <Moon className="w-6 h-6 text-indigo-400" />
  }

  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-tactical-400">Unable to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-tactical-800 rounded-xl">
            {getTimeIcon()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-tactical-100">
              {greeting}, {data.userName}
            </h1>
            <p className="text-tactical-400 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Streak Badge */}
        {data.journalStreak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-semibold">{data.journalStreak} day streak</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/coach" className="flex items-center gap-3 p-4 bg-accent-600/20 hover:bg-accent-600/30 rounded-xl border border-accent-500/30 transition-all group">
          <MessageSquare className="w-5 h-5 text-accent-400" />
          <span className="text-accent-400 font-medium">Talk to Coach</span>
          <ChevronRight className="w-4 h-4 text-accent-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link href="/journal" className="flex items-center gap-3 p-4 bg-pink-500/20 hover:bg-pink-500/30 rounded-xl border border-pink-500/30 transition-all group">
          <BookOpen className="w-5 h-5 text-pink-400" />
          <span className="text-pink-400 font-medium">Write Entry</span>
          <ChevronRight className="w-4 h-4 text-pink-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link href="/interventions" className="flex items-center gap-3 p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl border border-purple-500/30 transition-all group">
          <Play className="w-5 h-5 text-purple-400" />
          <span className="text-purple-400 font-medium">Start Exercise</span>
          <ChevronRight className="w-4 h-4 text-purple-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link href="/assessments" className="flex items-center gap-3 p-4 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl border border-emerald-500/30 transition-all group">
          <ClipboardList className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">Take Assessment</span>
          <ChevronRight className="w-4 h-4 text-emerald-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-tactical-500">Goals</span>
          </div>
          <p className="text-2xl font-bold text-tactical-100">{data.activeGoals}</p>
          <p className="text-xs text-tactical-400">Active • {data.completedGoals} completed</p>
        </div>
        
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 text-pink-400" />
            <span className="text-xs text-tactical-500">Journal</span>
          </div>
          <p className="text-2xl font-bold text-tactical-100">{data.weeklyEntries}</p>
          <p className="text-xs text-tactical-400">This week • {data.totalEntries} total</p>
        </div>
        
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-tactical-500">Exercises</span>
          </div>
          <p className="text-2xl font-bold text-tactical-100">{data.weeklyCompletions}</p>
          <p className="text-xs text-tactical-400">This week • {data.totalCompletions} total</p>
        </div>
        
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <Waves className="w-5 h-5 text-cyan-400" />
            <span className="text-xs text-tactical-500">NuCalm</span>
          </div>
          <p className="text-2xl font-bold text-tactical-100">{data.totalSessions}</p>
          <p className="text-xs text-tactical-400">Sessions • {data.totalMinutes} min</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Active Goals */}
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-tactical-800">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-tactical-100">Active Goals</h2>
            </div>
            <Link href="/goals" className="text-xs text-accent-400 hover:text-accent-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="p-4">
            {data.recentGoals.filter(g => g.status === 'active').length === 0 ? (
              <div className="text-center py-6">
                <Target className="w-8 h-8 text-tactical-700 mx-auto mb-2" />
                <p className="text-sm text-tactical-500">No active goals</p>
                <Link href="/goals" className="text-xs text-accent-400 hover:underline">Create one →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentGoals.filter(g => g.status === 'active').slice(0, 3).map((goal) => (
                  <div key={goal.id} className="p-3 bg-tactical-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-tactical-200 text-sm">{goal.title}</h3>
                      <span className="text-xs text-accent-400">{goal.progress_percent || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-tactical-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent-500 rounded-full transition-all"
                        style={{ width: `${goal.progress_percent || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Journal Entries */}
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-tactical-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-400" />
              <h2 className="font-semibold text-tactical-100">Recent Journal</h2>
            </div>
            <Link href="/journal" className="text-xs text-accent-400 hover:text-accent-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="p-4">
            {data.recentEntries.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="w-8 h-8 text-tactical-700 mx-auto mb-2" />
                <p className="text-sm text-tactical-500">No journal entries yet</p>
                <Link href="/journal" className="text-xs text-accent-400 hover:underline">Write one →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentEntries.map((entry) => (
                  <div key={entry.id} className="p-3 bg-tactical-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-pink-400 capitalize">{entry.entry_type}</span>
                      <span className="text-xs text-tactical-500">{formatDate(entry.created_at)}</span>
                    </div>
                    <p className="text-sm text-tactical-300 line-clamp-2">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NuCalm Progress */}
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-tactical-800">
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-cyan-400" />
              <h2 className="font-semibold text-tactical-100">NuCalm Impact</h2>
            </div>
            <Link href="/nucalm" className="text-xs text-accent-400 hover:text-accent-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="p-4">
            {data.totalSessions === 0 ? (
              <div className="text-center py-6">
                <Waves className="w-8 h-8 text-tactical-700 mx-auto mb-2" />
                <p className="text-sm text-tactical-500">No NuCalm sessions yet</p>
                <Link href="/nucalm" className="text-xs text-accent-400 hover:underline">Log one →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-tactical-800/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                    <span className="text-xl font-bold text-tactical-100">+{data.avgMoodImprovement.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-tactical-400">Avg Mood Lift</p>
                </div>
                <div className="text-center p-3 bg-tactical-800/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ArrowDownRight className="w-4 h-4 text-green-400" />
                    <span className="text-xl font-bold text-tactical-100">-{data.avgStressReduction.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-tactical-400">Avg Stress Drop</p>
                </div>
                <div className="col-span-2 text-center p-3 bg-tactical-800/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-lg font-bold text-tactical-100">{data.totalMinutes}</span>
                    <span className="text-sm text-tactical-400">total minutes of recovery</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-tactical-800">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
              <h2 className="font-semibold text-tactical-100">Recent Assessments</h2>
            </div>
            <Link href="/assessments" className="text-xs text-accent-400 hover:text-accent-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="p-4">
            {data.recentAssessments.length === 0 ? (
              <div className="text-center py-6">
                <ClipboardList className="w-8 h-8 text-tactical-700 mx-auto mb-2" />
                <p className="text-sm text-tactical-500">No assessments completed</p>
                <Link href="/assessments" className="text-xs text-accent-400 hover:underline">Take one →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="p-3 bg-tactical-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-tactical-200 text-sm capitalize">
                          {assessment.assessment_type.replace('_', ' ')}
                        </h3>
                        <p className="text-xs text-tactical-500">{formatDate(assessment.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent-400">{assessment.total_score}</p>
                        <p className="text-xs text-tactical-500">Score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Exercises */}
      <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-tactical-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold text-tactical-100">Recent Exercises</h2>
          </div>
          <Link href="/interventions" className="text-xs text-accent-400 hover:text-accent-300 transition-colors">
            View all →
          </Link>
        </div>
        <div className="p-4">
          {data.recentCompletions.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles className="w-8 h-8 text-tactical-700 mx-auto mb-2" />
              <p className="text-sm text-tactical-500">No exercises completed yet</p>
              <Link href="/interventions" className="text-xs text-accent-400 hover:underline">Start one →</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {data.recentCompletions.map((completion) => (
                <div key={completion.id} className="p-3 bg-tactical-800/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-tactical-200 text-sm">{completion.intervention_name}</h3>
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-tactical-500">
                    <Clock className="w-3 h-3" />
                    {Math.round(completion.duration_seconds / 60)} min
                    <span className="text-tactical-600">•</span>
                    {formatDate(completion.completed_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/library" className="flex items-center gap-3 p-4 bg-tactical-800/50 hover:bg-tactical-800 rounded-xl border border-tactical-700 transition-all">
          <GraduationCap className="w-5 h-5 text-amber-400" />
          <span className="text-tactical-300 text-sm">Wellbeing Library</span>
        </Link>
        <Link href="/goals" className="flex items-center gap-3 p-4 bg-tactical-800/50 hover:bg-tactical-800 rounded-xl border border-tactical-700 transition-all">
          <Target className="w-5 h-5 text-blue-400" />
          <span className="text-tactical-300 text-sm">Manage Goals</span>
        </Link>
        <Link href="/assessments" className="flex items-center gap-3 p-4 bg-tactical-800/50 hover:bg-tactical-800 rounded-xl border border-tactical-700 transition-all">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span className="text-tactical-300 text-sm">Track Progress</span>
        </Link>
        <Link href="/nucalm" className="flex items-center gap-3 p-4 bg-tactical-800/50 hover:bg-tactical-800 rounded-xl border border-tactical-700 transition-all">
          <Waves className="w-5 h-5 text-cyan-400" />
          <span className="text-tactical-300 text-sm">NuCalm Sessions</span>
        </Link>
      </div>
    </div>
  )
}
