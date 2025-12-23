'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  X,
  Loader2,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react'

interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string | null
  target_value: number | null
  current_value: number | null
  unit: string | null
  progress_percent: number
  start_date: string | null
  target_date: string | null
  status: string
  completed_at: string | null
  created_at: string
}

const CATEGORIES = [
  { value: 'physical', label: 'Physical Health', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'mental', label: 'Mental Wellness', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'sleep', label: 'Sleep', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'nutrition', label: 'Nutrition', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'relationships', label: 'Relationships', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { value: 'career', label: 'Career', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'financial', label: 'Financial', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'personal', label: 'Personal Growth', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [isClient, setIsClient] = useState(false)
  
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_value: '',
    current_value: '0',
    unit: '',
    target_date: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
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

      const targetVal = formData.target_value ? parseFloat(formData.target_value) : null
      const currentVal = formData.current_value ? parseFloat(formData.current_value) : 0
      const progressPercent = targetVal ? Math.round((currentVal / targetVal) * 100) : 0

      const goalData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        target_value: targetVal,
        current_value: currentVal,
        unit: formData.unit || null,
        progress_percent: Math.min(progressPercent, 100),
        target_date: formData.target_date || null,
        status: 'active',
        updated_at: new Date().toISOString(),
      }

      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', editingGoal.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('goals')
          .insert([{ ...goalData, start_date: new Date().toISOString().split('T')[0] }])

        if (error) throw error
      }

      setShowModal(false)
      setEditingGoal(null)
      resetForm()
      fetchGoals()
    } catch (error) {
      console.error('Error saving goal:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description || '',
      category: goal.category || 'personal',
      target_value: goal.target_value?.toString() || '',
      current_value: goal.current_value?.toString() || '0',
      unit: goal.unit || '',
      target_date: goal.target_date || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error
      fetchGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const toggleComplete = async (goal: Goal) => {
    try {
      const newStatus = goal.status === 'completed' ? 'active' : 'completed'
      const { error } = await supabase
        .from('goals')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
          progress_percent: newStatus === 'completed' ? 100 : goal.progress_percent,
        })
        .eq('id', goal.id)

      if (error) throw error
      fetchGoals()
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const updateProgress = async (goal: Goal, newValue: number) => {
    try {
      const progressPercent = goal.target_value 
        ? Math.min(Math.round((newValue / goal.target_value) * 100), 100)
        : 0

      const { error } = await supabase
        .from('goals')
        .update({ 
          current_value: newValue,
          progress_percent: progressPercent,
          status: progressPercent >= 100 ? 'completed' : 'active',
          completed_at: progressPercent >= 100 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goal.id)

      if (error) throw error
      fetchGoals()
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      target_value: '',
      current_value: '0',
      unit: '',
      target_date: '',
    })
  }

  const filteredGoals = goals.filter(goal => {
    if (filter === 'active') return goal.status === 'active'
    if (filter === 'completed') return goal.status === 'completed'
    return true
  })

  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    avgProgress: goals.length > 0 
      ? Math.round(goals.reduce((acc, g) => acc + (g.progress_percent || 0), 0) / goals.length)
      : 0,
  }

  const getCategoryStyle = (category: string | null) => {
    return CATEGORIES.find(c => c.value === category)?.color || 'bg-tactical-700 text-tactical-300 border-tactical-600'
  }

  const getCategoryLabel = (category: string | null) => {
    return CATEGORIES.find(c => c.value === category)?.label || category || 'General'
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysRemaining = (targetDate: string | null) => {
    if (!targetDate) return null
    const today = new Date()
    const target = new Date(targetDate)
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
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
          <h1 className="text-2xl font-bold text-tactical-100">Goals</h1>
          <p className="text-tactical-400 text-sm">Track your wellness objectives</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingGoal(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-600/20 rounded-lg">
              <Target className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tactical-100">{stats.total}</p>
              <p className="text-xs text-tactical-400">Total Goals</p>
            </div>
          </div>
        </div>
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tactical-100">{stats.active}</p>
              <p className="text-xs text-tactical-400">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Award className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tactical-100">{stats.completed}</p>
              <p className="text-xs text-tactical-400">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tactical-100">{stats.avgProgress}%</p>
              <p className="text-xs text-tactical-400">Avg Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-accent-600/20 text-accent-400 border border-accent-500/30'
                : 'bg-tactical-800 text-tactical-400 hover:text-tactical-200 border border-tactical-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-12 bg-tactical-900/50 rounded-xl border border-tactical-800">
          <Target className="w-12 h-12 text-tactical-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-tactical-300 mb-1">No goals yet</h3>
          <p className="text-tactical-500 text-sm mb-4">Create your first goal to start tracking progress</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-sm transition-colors"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGoals.map((goal) => {
            const daysRemaining = getDaysRemaining(goal.target_date)
            
            return (
              <div
                key={goal.id}
                className={`bg-tactical-900/50 rounded-xl border border-tactical-800 p-5 transition-all ${
                  goal.status === 'completed' ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Completion Toggle */}
                    <button
                      onClick={() => toggleComplete(goal)}
                      className="mt-1 flex-shrink-0"
                    >
                      {goal.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-tactical-600 hover:text-accent-400 transition-colors" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Title & Category */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-semibold text-lg ${
                          goal.status === 'completed' ? 'text-tactical-400 line-through' : 'text-tactical-100'
                        }`}>
                          {goal.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${getCategoryStyle(goal.category)}`}>
                          {getCategoryLabel(goal.category)}
                        </span>
                      </div>

                      {/* Description */}
                      {goal.description && (
                        <p className="text-tactical-400 text-sm mb-3">{goal.description}</p>
                      )}

                      {/* Progress Bar */}
                      {goal.target_value && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-tactical-400">
                              {goal.current_value || 0} / {goal.target_value} {goal.unit}
                            </span>
                            <span className="text-accent-400 font-medium">{goal.progress_percent}%</span>
                          </div>
                          <div className="h-2 bg-tactical-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full transition-all duration-500"
                              style={{ width: `${goal.progress_percent}%` }}
                            />
                          </div>
                          
                          {/* Quick Progress Update */}
                          {goal.status !== 'completed' && (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="number"
                                value={goal.current_value || 0}
                                onChange={(e) => updateProgress(goal, parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 bg-tactical-800 border border-tactical-700 rounded text-sm text-tactical-200 focus:outline-none focus:ring-1 focus:ring-accent-500"
                                min="0"
                                max={goal.target_value}
                              />
                              <span className="text-tactical-500 text-xs">{goal.unit}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-xs text-tactical-500">
                        {goal.target_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Due {formatDate(goal.target_date)}</span>
                            {daysRemaining !== null && goal.status !== 'completed' && (
                              <span className={`ml-1 ${
                                daysRemaining < 0 ? 'text-red-400' : 
                                daysRemaining <= 7 ? 'text-yellow-400' : 'text-tactical-500'
                              }`}>
                                ({daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days left`})
                              </span>
                            )}
                          </div>
                        )}
                        {goal.completed_at && (
                          <div className="flex items-center gap-1 text-green-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed {formatDate(goal.completed_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 hover:bg-tactical-800 rounded-lg transition-colors text-tactical-400 hover:text-tactical-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
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
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingGoal(null)
                  resetForm()
                }}
                className="p-2 hover:bg-tactical-800 rounded-lg transition-colors text-tactical-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-tactical-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Run 3 times per week"
                  className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-tactical-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Why is this goal important to you?"
                  rows={3}
                  className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-tactical-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target & Progress */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-tactical-300 mb-1">
                    Target
                  </label>
                  <input
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tactical-300 mb-1">
                    Current
                  </label>
                  <input
                    type="number"
                    value={formData.current_value}
                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tactical-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="miles, hours, etc."
                    className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  />
                </div>
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-sm font-medium text-tactical-300 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingGoal(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-3 bg-tactical-800 hover:bg-tactical-700 text-tactical-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !formData.title}
                  className="flex-1 px-4 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-tactical-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingGoal ? 'Update Goal' : 'Create Goal'
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
