'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  BookOpen, 
  Calendar,
  Trash2, 
  Edit3, 
  X,
  Loader2,
  Heart,
  Sun,
  Moon,
  Cloud,
  Smile,
  Meh,
  Frown,
  Search,
  Filter
} from 'lucide-react'

interface JournalEntry {
  id: string
  user_id: string
  entry_type: string
  content: string
  mood_before: number | null
  mood_after: number | null
  created_at: string
}

const ENTRY_TYPES = [
  { 
    value: 'gratitude', 
    label: 'Gratitude', 
    icon: Heart,
    prompt: "What are 3 things you're grateful for today?",
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    bgColor: 'bg-pink-500/10'
  },
  { 
    value: 'reflection', 
    label: 'Reflection', 
    icon: Sun,
    prompt: 'What went well today? What did you learn?',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    bgColor: 'bg-yellow-500/10'
  },
  { 
    value: 'debrief', 
    label: 'Shift Debrief', 
    icon: Moon,
    prompt: 'Process your shift. What happened? How do you feel about it?',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    bgColor: 'bg-blue-500/10'
  },
  { 
    value: 'freewrite', 
    label: 'Free Write', 
    icon: Cloud,
    prompt: 'Write freely about whatever is on your mind...',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    bgColor: 'bg-purple-500/10'
  },
]

const MOODS = [
  { value: 1, label: 'Very Low', icon: Frown, color: 'text-red-400' },
  { value: 2, label: 'Low', icon: Frown, color: 'text-orange-400' },
  { value: 3, label: 'Neutral', icon: Meh, color: 'text-yellow-400' },
  { value: 4, label: 'Good', icon: Smile, color: 'text-lime-400' },
  { value: 5, label: 'Great', icon: Smile, color: 'text-green-400' },
]

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isClient, setIsClient] = useState(false)
  
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    entry_type: 'gratitude',
    content: '',
    mood_before: 3,
    mood_after: 3,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
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

      const entryData = {
        user_id: user.id,
        entry_type: formData.entry_type,
        content: formData.content,
        mood_before: formData.mood_before,
        mood_after: formData.mood_after,
      }

      if (editingEntry) {
        const { error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', editingEntry.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('journal_entries')
          .insert([entryData])

        if (error) throw error
      }

      setShowModal(false)
      setEditingEntry(null)
      resetForm()
      fetchEntries()
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setFormData({
      entry_type: entry.entry_type,
      content: entry.content,
      mood_before: entry.mood_before || 3,
      mood_after: entry.mood_after || 3,
    })
    setShowModal(true)
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error
      fetchEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      entry_type: 'gratitude',
      content: '',
      mood_before: 3,
      mood_after: 3,
    })
  }

  const startNewEntry = (type: string) => {
    resetForm()
    setFormData(prev => ({ ...prev, entry_type: type }))
    setEditingEntry(null)
    setShowModal(true)
  }

  const filteredEntries = entries.filter(entry => {
    const matchesType = filterType === 'all' || entry.entry_type === filterType
    const matchesSearch = searchQuery === '' || 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const getEntryTypeConfig = (type: string) => {
    return ENTRY_TYPES.find(t => t.value === type) || ENTRY_TYPES[3]
  }

  const getMoodConfig = (value: number | null) => {
    if (!value) return MOODS[2]
    return MOODS.find(m => m.value === value) || MOODS[2]
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  // Stats
  const thisWeekEntries = entries.filter(e => {
    const entryDate = new Date(e.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return entryDate >= weekAgo
  })

  const avgMoodAfter = entries.length > 0
    ? (entries.reduce((acc, e) => acc + (e.mood_after || 3), 0) / entries.length).toFixed(1)
    : '0'

  const currentStreak = (() => {
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      
      const hasEntry = entries.some(e => {
        const entryDate = new Date(e.created_at)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === checkDate.getTime()
      })
      
      if (hasEntry) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  })()

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
          <h1 className="text-2xl font-bold text-tactical-100">Journal</h1>
          <p className="text-tactical-400 text-sm">Reflect, process, and grow</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingEntry(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Entry
        </button>
      </div>

      {/* Quick Entry Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ENTRY_TYPES.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.value}
              onClick={() => startNewEntry(type.value)}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${type.bgColor} border-tactical-800 hover:border-tactical-700`}
            >
              <Icon className={`w-6 h-6 mb-2 ${type.color.split(' ')[1]}`} />
              <h3 className="font-medium text-tactical-200 text-sm">{type.label}</h3>
            </button>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4 text-center">
          <p className="text-2xl font-bold text-tactical-100">{thisWeekEntries.length}</p>
          <p className="text-xs text-tactical-400">This Week</p>
        </div>
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4 text-center">
          <p className="text-2xl font-bold text-tactical-100">{currentStreak}</p>
          <p className="text-xs text-tactical-400">Day Streak</p>
        </div>
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4 text-center">
          <p className="text-2xl font-bold text-tactical-100">{avgMoodAfter}</p>
          <p className="text-xs text-tactical-400">Avg Mood</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tactical-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-10 pr-4 py-2 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-tactical-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
          >
            <option value="all">All Types</option>
            {ENTRY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Entries List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12 bg-tactical-900/50 rounded-xl border border-tactical-800">
          <BookOpen className="w-12 h-12 text-tactical-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-tactical-300 mb-1">
            {searchQuery || filterType !== 'all' ? 'No matching entries' : 'No journal entries yet'}
          </h3>
          <p className="text-tactical-500 text-sm mb-4">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Start writing to process your thoughts and feelings'}
          </p>
          {!searchQuery && filterType === 'all' && (
            <button
              onClick={() => startNewEntry('gratitude')}
              className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-sm transition-colors"
            >
              Write First Entry
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const typeConfig = getEntryTypeConfig(entry.entry_type)
            const TypeIcon = typeConfig.icon
            const moodBefore = getMoodConfig(entry.mood_before)
            const moodAfter = getMoodConfig(entry.mood_after)
            const MoodBeforeIcon = moodBefore.icon
            const MoodAfterIcon = moodAfter.icon

            return (
              <div
                key={entry.id}
                className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Type Icon */}
                    <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                      <TypeIcon className={`w-5 h-5 ${typeConfig.color.split(' ')[1]}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <span className="text-xs text-tactical-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(entry.created_at)}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-tactical-200 whitespace-pre-wrap mb-3">
                        {entry.content}
                      </p>

                      {/* Mood */}
                      {(entry.mood_before || entry.mood_after) && (
                        <div className="flex items-center gap-4 text-xs text-tactical-500">
                          <div className="flex items-center gap-1">
                            <span>Before:</span>
                            <MoodBeforeIcon className={`w-4 h-4 ${moodBefore.color}`} />
                            <span className={moodBefore.color}>{moodBefore.label}</span>
                          </div>
                          <div className="text-tactical-700">→</div>
                          <div className="flex items-center gap-1">
                            <span>After:</span>
                            <MoodAfterIcon className={`w-4 h-4 ${moodAfter.color}`} />
                            <span className={moodAfter.color}>{moodAfter.label}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 hover:bg-tactical-800 rounded-lg transition-colors text-tactical-400 hover:text-tactical-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
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
                {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingEntry(null)
                  resetForm()
                }}
                className="p-2 hover:bg-tactical-800 rounded-lg transition-colors text-tactical-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Entry Type */}
              <div>
                <label className="block text-sm font-medium text-tactical-300 mb-2">
                  Entry Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ENTRY_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, entry_type: type.value })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.entry_type === type.value
                            ? `${type.color} border-current`
                            : 'bg-tactical-800 border-tactical-700 text-tactical-400 hover:border-tactical-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Mood Before */}
              <div>
                <label className="block text-sm font-medium text-tactical-300 mb-2">
                  How are you feeling right now?
                </label>
                <div className="flex items-center justify-between gap-2">
                  {MOODS.map((mood) => {
                    const Icon = mood.icon
                    return (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, mood_before: mood.value })}
                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                          formData.mood_before === mood.value
                            ? `bg-tactical-800 border-accent-500 ${mood.color}`
                            : 'bg-tactical-800 border-tactical-700 text-tactical-500 hover:border-tactical-600'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs">{mood.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-tactical-300 mb-1">
                  Your thoughts
                </label>
                <p className="text-xs text-tactical-500 mb-2">
                  {getEntryTypeConfig(formData.entry_type).prompt}
                </p>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Start writing..."
                  rows={6}
                  className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 resize-none"
                  required
                />
              </div>

              {/* Mood After */}
              <div>
                <label className="block text-sm font-medium text-tactical-300 mb-2">
                  How do you feel after writing?
                </label>
                <div className="flex items-center justify-between gap-2">
                  {MOODS.map((mood) => {
                    const Icon = mood.icon
                    return (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, mood_after: mood.value })}
                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                          formData.mood_after === mood.value
                            ? `bg-tactical-800 border-accent-500 ${mood.color}`
                            : 'bg-tactical-800 border-tactical-700 text-tactical-500 hover:border-tactical-600'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs">{mood.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingEntry(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-3 bg-tactical-800 hover:bg-tactical-700 text-tactical-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !formData.content}
                  className="flex-1 px-4 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-tactical-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingEntry ? 'Update Entry' : 'Save Entry'
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
