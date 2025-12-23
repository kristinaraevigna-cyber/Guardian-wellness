'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus,
  Waves,
  Calendar,
  Clock,
  Heart,
  Trash2,
  Edit3,
  X,
  Loader2,
  TrendingUp,
  Timer,
  Activity,
  Zap,
  ChevronDown,
  BarChart3
} from 'lucide-react'

interface NuCalmSession {
  id: string
  user_id: string
  session_date: string
  duration_minutes: number
  session_type: string
  mood_before: number
  mood_after: number
  stress_before: number
  stress_after: number
  hrv_before: number | null
  hrv_after: number | null
  notes: string | null
  created_at: string
}

const SESSION_TYPES = [
  { value: 'rescue', label: 'Rescue', description: '20-minute reset', duration: 20 },
  { value: 'recover', label: 'Recover', description: '30-minute recovery', duration: 30 },
  { value: 'reboot', label: 'Reboot', description: '45-minute deep session', duration: 45 },
  { value: 'sleep', label: 'Sleep', description: 'Pre-sleep relaxation', duration: 30 },
  { value: 'custom', label: 'Custom', description: 'Custom duration', duration: 0 },
]

export default function NuCalmPage() {
  const [sessions, setSessions] = useState<NuCalmSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSession, setEditingSession] = useState<NuCalmSession | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list')
  
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    session_date: new Date().toISOString().split('T')[0],
    session_time: new Date().toTimeString().slice(0, 5),
    duration_minutes: 20,
    session_type: 'rescue',
    mood_before: 5,
    mood_after: 7,
    stress_before: 6,
    stress_after: 3,
    hrv_before: '',
    hrv_after: '',
    notes: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('nucalm_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const sessionData = {
        user_id: user.id,
        session_date: `${formData.session_date}T${formData.session_time}:00`,
        duration_minutes: formData.duration_minutes,
        session_type: formData.session_type,
        mood_before: formData.mood_before,
        mood_after: formData.mood_after,
        stress_before: formData.stress_before,
        stress_after: formData.stress_after,
        hrv_before: formData.hrv_before ? parseInt(formData.hrv_before) : null,
        hrv_after: formData.hrv_after ? parseInt(formData.hrv_after) : null,
        notes: formData.notes || null,
      }

      if (editingSession) {
        const { error } = await supabase
          .from('nucalm_sessions')
          .update(sessionData)
          .eq('id', editingSession.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('nucalm_sessions')
          .insert([sessionData])

        if (error) throw error
      }

      setShowModal(false)
      setEditingSession(null)
      resetForm()
      fetchSessions()
    } catch (error) {
      console.error('Error saving session:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (session: NuCalmSession) => {
    const date = new Date(session.session_date)
    setEditingSession(session)
    setFormData({
      session_date: date.toISOString().split('T')[0],
      session_time: date.toTimeString().slice(0, 5),
      duration_minutes: session.duration_minutes,
      session_type: session.session_type,
      mood_before: session.mood_before,
      mood_after: session.mood_after,
      stress_before: session.stress_before,
      stress_after: session.stress_after,
      hrv_before: session.hrv_before?.toString() || '',
      hrv_after: session.hrv_after?.toString() || '',
      notes: session.notes || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return

    try {
      const { error } = await supabase
        .from('nucalm_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
      fetchSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      session_date: new Date().toISOString().split('T')[0],
      session_time: new Date().toTimeString().slice(0, 5),
      duration_minutes: 20,
      session_type: 'rescue',
      mood_before: 5,
      mood_after: 7,
      stress_before: 6,
      stress_after: 3,
      hrv_before: '',
      hrv_after: '',
      notes: '',
    })
  }

  const handleSessionTypeChange = (type: string) => {
    const sessionType = SESSION_TYPES.find(t => t.value === type)
    setFormData(prev => ({
      ...prev,
      session_type: type,
      duration_minutes: sessionType?.duration || prev.duration_minutes
    }))
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Calculate stats
  const stats = {
    totalSessions: sessions.length,
    totalMinutes: sessions.reduce((acc, s) => acc + s.duration_minutes, 0),
    avgMoodImprovement: sessions.length > 0
      ? (sessions.reduce((acc, s) => acc + (s.mood_after - s.mood_before), 0) / sessions.length).toFixed(1)
      : '0',
    avgStressReduction: sessions.length > 0
      ? (sessions.reduce((acc, s) => acc + (s.stress_before - s.stress_after), 0) / sessions.length).toFixed(1)
      : '0',
    thisWeek: sessions.filter(s => {
      const sessionDate = new Date(s.session_date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return sessionDate >= weekAgo
    }).length,
    avgHrvImprovement: (() => {
      const sessionsWithHrv = sessions.filter(s => s.hrv_before && s.hrv_after)
      if (sessionsWithHrv.length === 0) return null
      const total = sessionsWithHrv.reduce((acc, s) => acc + ((s.hrv_after || 0) - (s.hrv_before || 0)), 0)
      return (total / sessionsWithHrv.length).toFixed(1)
    })(),
  }

  const getSessionTypeLabel = (type: string) => {
    return SESSION_TYPES.find(t => t.value === type)?.label || type
  }

  const getMoodColor = (value: number) => {
    if (value >= 8) return 'text-green-400'
    if (value >= 6) return 'text-lime-400'
    if (value >= 4) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getStressColor = (value: number) => {
    if (value <= 2) return 'text-green-400'
    if (value <= 4) return 'text-lime-400'
    if (value <= 6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tactical-100">NuCalm Sessions</h1>
          <p className="text-tactical-400 text-sm">Track your neuroscience-based recovery</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingSession(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Log Session
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-600/20 rounded-lg">
              <Waves className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tactical-100">{stats.totalSessions}</p>
              <p className="text-xs text-tactical-400">Total Sessions</p>
            </div>
          </div>
        </div>
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Timer className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tactical-100">{stats.totalMinutes}</p>
              <p className="text-xs text-tactical-400">Total Minutes</p>
            </div>
          </div>
        </div>
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tactical-100">+{stats.avgMoodImprovement}</p>
              <p className="text-xs text-tactical-400">Avg Mood Lift</p>
            </div>
          </div>
        </div>
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tactical-100">-{stats.avgStressReduction}</p>
              <p className="text-xs text-tactical-400">Avg Stress Drop</p>
            </div>
          </div>
        </div>
      </div>

      {/* HRV Stat (if available) */}
      {stats.avgHrvImprovement && (
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <Activity className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-tactical-100">+{stats.avgHrvImprovement} ms</p>
              <p className="text-xs text-tactical-400">Average HRV Improvement</p>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-tactical-900/50 rounded-xl border border-tactical-800">
          <Waves className="w-12 h-12 text-tactical-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-tactical-300 mb-1">No sessions logged yet</h3>
          <p className="text-tactical-500 text-sm mb-4">Start tracking your NuCalm sessions to see your progress</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-sm transition-colors"
          >
            Log First Session
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const moodChange = session.mood_after - session.mood_before
            const stressChange = session.stress_before - session.stress_after
            
            return (
              <div
                key={session.id}
                className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="p-3 bg-accent-600/20 rounded-xl">
                      <Waves className="w-6 h-6 text-accent-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-tactical-100">
                          {getSessionTypeLabel(session.session_type)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-tactical-800 text-tactical-400">
                          {session.duration_minutes} min
                        </span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-4 text-sm text-tactical-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(session.session_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(session.session_date)}
                        </span>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-tactical-500 text-xs mb-1">Mood</p>
                          <p className="text-tactical-200">
                            {session.mood_before} → {session.mood_after}
                            <span className={`ml-1 ${moodChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({moodChange >= 0 ? '+' : ''}{moodChange})
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-tactical-500 text-xs mb-1">Stress</p>
                          <p className="text-tactical-200">
                            {session.stress_before} → {session.stress_after}
                            <span className={`ml-1 ${stressChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({stressChange >= 0 ? '-' : '+'}{Math.abs(stressChange)})
                            </span>
                          </p>
                        </div>
                        {session.hrv_before && session.hrv_after && (
                          <>
                            <div>
                              <p className="text-tactical-500 text-xs mb-1">HRV Before</p>
                              <p className="text-tactical-200">{session.hrv_before} ms</p>
                            </div>
                            <div>
                              <p className="text-tactical-500 text-xs mb-1">HRV After</p>
                              <p className="text-tactical-200">
                                {session.hrv_after} ms
                                <span className={`ml-1 ${(session.hrv_after - session.hrv_before) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ({(session.hrv_after - session.hrv_before) >= 0 ? '+' : ''}{session.hrv_after - session.hrv_before})
                                </span>
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Notes */}
                      {session.notes && (
                        <p className="text-sm text-tactical-400 mt-3 italic">"{session.notes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(session)}
                      className="p-2 hover:bg-tactical-800 rounded-lg transition-colors text-tactical-400 hover:text-tactical-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-tactical-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-tactical-900 border border-tactical-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-tactical-800">
              <h2 className="text-lg font-semibold text-tactical-100">
                {editingSession ? 'Edit Session' : 'Log NuCalm Session'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingSession(null)
                  resetForm()
                }}
                className="p-2 hover:bg-tactical-800 rounded-lg transition-colors text-tactical-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-tactical-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.session_date}
                    onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                    className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tactical-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.session_time}
                    onChange={(e) => setFormData({ ...formData, session_time: e.target.value })}
                    className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  />
                </div>
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-tactical-300 mb-2">Session Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {SESSION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleSessionTypeChange(type.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.session_type === type.value
                          ? 'bg-accent-600/20 border-accent-500 text-accent-400'
                          : 'bg-tactical-800 border-tactical-700 text-tactical-400 hover:border-tactical-600'
                      }`}
                    >
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs block text-tactical-500">{type.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-tactical-300 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="120"
                  className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                />
              </div>

              {/* Mood Before/After */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-tactical-300 mb-1">Mood Before (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.mood_before}
                    onChange={(e) => setFormData({ ...formData, mood_before: parseInt(e.target.value) })}
                    className="w-full accent-accent-500"
                  />
                  <p className={`text-center text-lg font-bold ${getMoodColor(formData.mood_before)}`}>
                    {formData.mood_before}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tactical-300 mb-1">Mood After (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.mood_after}
                    onChange={(e) => setFormData({ ...formData, mood_after: parseInt(e.target.value) })}
                    className="w-full accent-accent-500"
                  />
                  <p className={`text-center text-lg font-bold ${getMoodColor(formData.mood_after)}`}>
                    {formData.mood_after}
                  </p>
                </div>
              </div>

              {/* Stress Before/After */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-tactical-300 mb-1">Stress Before (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.stress_before}
                    onChange={(e) => setFormData({ ...formData, stress_before: parseInt(e.target.value) })}
                    className="w-full accent-accent-500"
                  />
                  <p className={`text-center text-lg font-bold ${getStressColor(10 - formData.stress_before)}`}>
                    {formData.stress_before}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tactical-300 mb-1">Stress After (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.stress_after}
                    onChange={(e) => setFormData({ ...formData, stress_after: parseInt(e.target.value) })}
                    className="w-full accent-accent-500"
                  />
                  <p className={`text-center text-lg font-bold ${getStressColor(10 - formData.stress_after)}`}>
                    {formData.stress_after}
                  </p>
                </div>
              </div>

              {/* HRV (Optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-tactical-300 mb-1">HRV Before (ms) - Optional</label>
                  <input
                    type="number"
                    value={formData.hrv_before}
                    onChange={(e) => setFormData({ ...formData, hrv_before: e.target.value })}
                    placeholder="e.g., 45"
                    className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tactical-300 mb-1">HRV After (ms) - Optional</label>
                  <input
                    type="number"
                    value={formData.hrv_after}
                    onChange={(e) => setFormData({ ...formData, hrv_after: e.target.value })}
                    placeholder="e.g., 55"
                    className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-tactical-300 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="How did the session feel? Any observations?"
                  rows={3}
                  className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingSession(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-3 bg-tactical-800 hover:bg-tactical-700 text-tactical-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-tactical-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingSession ? 'Update Session' : 'Log Session'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
