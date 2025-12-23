'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Sparkles,
  Brain,
  Heart,
  Moon,
  Wind,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Loader2,
  Clock,
  Award,
  Calendar,
  Users,
  Star
} from 'lucide-react'

// ============================================
// INTERVENTION DATA - EXPANDED (25 exercises)
// ============================================

interface Intervention {
  id: string
  name: string
  description: string
  category: string
  instructions: string
  duration_minutes: number
  difficulty_level: string
  evidence_base: string
}

const INTERVENTIONS: Intervention[] = [
  // STRESS MANAGEMENT (4)
  {
    id: 'stress-001',
    name: 'Tactical Breathing (Box Breathing)',
    description: 'A powerful technique used by military and law enforcement to rapidly reduce stress and regain focus.',
    category: 'stress_management',
    instructions: `1. Breathe IN through your nose for 4 seconds
2. HOLD your breath for 4 seconds
3. Breathe OUT through your mouth for 4 seconds
4. HOLD empty for 4 seconds
5. Repeat 4-6 cycles

Tip: Visualize tracing the sides of a square as you breathe.`,
    duration_minutes: 2,
    difficulty_level: 'beginner',
    evidence_base: 'Research shows box breathing activates the parasympathetic nervous system, reducing cortisol and heart rate within minutes.'
  },
  {
    id: 'stress-002',
    name: 'Progressive Muscle Relaxation',
    description: 'Systematically tense and release muscle groups to reduce physical tension and anxiety.',
    category: 'stress_management',
    instructions: `1. Find a comfortable position
2. Starting with your feet, tense muscles for 5 seconds
3. Release and notice the relaxation for 10 seconds
4. Move up through calves, thighs, abdomen, chest, hands, arms, shoulders, neck, and face
5. End with 3 deep breaths`,
    duration_minutes: 10,
    difficulty_level: 'beginner',
    evidence_base: 'PMR has been shown to reduce anxiety, improve sleep quality, and lower blood pressure in multiple clinical trials.'
  },
  {
    id: 'stress-003',
    name: '4-7-8 Relaxing Breath',
    description: 'A calming breath pattern that acts as a natural tranquilizer for the nervous system.',
    category: 'stress_management',
    instructions: `1. Place the tip of your tongue behind your upper front teeth
2. Exhale completely through your mouth with a whoosh sound
3. Close your mouth and inhale quietly through your nose for 4 seconds
4. Hold your breath for 7 seconds
5. Exhale completely through your mouth for 8 seconds
6. Repeat for 3-4 cycles

Note: The ratio 4:7:8 is more important than the exact seconds.`,
    duration_minutes: 3,
    difficulty_level: 'beginner',
    evidence_base: 'Developed by Dr. Andrew Weil, this technique reduces anxiety and helps with sleep by activating the parasympathetic nervous system.'
  },
  {
    id: 'stress-004',
    name: 'Self-Compassion Break',
    description: 'A brief practice to respond to difficult moments with kindness rather than self-criticism.',
    category: 'stress_management',
    instructions: `When you notice you're under stress or struggling:

1. MINDFULNESS: Acknowledge the difficulty
   Say: "This is a moment of suffering" or "This is hard right now"

2. COMMON HUMANITY: Remember you're not alone
   Say: "Suffering is part of being human" or "Others feel this way too"

3. SELF-KINDNESS: Offer yourself compassion
   Place your hand on your heart and say: "May I be kind to myself"

4. Take a few breaths and notice how you feel`,
    duration_minutes: 3,
    difficulty_level: 'beginner',
    evidence_base: 'Research by Kristin Neff shows self-compassion reduces anxiety, depression, and stress while increasing resilience.'
  },

  // MINDFULNESS (5)
  {
    id: 'mindful-001',
    name: 'Body Scan Meditation',
    description: 'A guided awareness practice to release tension and reconnect with your physical state.',
    category: 'mindfulness',
    instructions: `1. Lie down or sit comfortably with eyes closed
2. Bring attention to your breath for 1 minute
3. Slowly move attention through your body:
   - Start at the top of your head
   - Notice sensations without judgment
   - Move down through face, neck, shoulders, arms, hands, chest, abdomen, hips, legs, feet
4. If you find tension, breathe into that area
5. End with awareness of your whole body`,
    duration_minutes: 10,
    difficulty_level: 'beginner',
    evidence_base: 'Body scan meditation reduces stress, improves sleep, and increases body awareness.'
  },
  {
    id: 'mindful-002',
    name: '5-4-3-2-1 Grounding',
    description: 'A quick grounding exercise to return to the present moment using your senses.',
    category: 'mindfulness',
    instructions: `Notice and name:
- 5 things you can SEE
- 4 things you can TOUCH/FEEL
- 3 things you can HEAR
- 2 things you can SMELL
- 1 thing you can TASTE

Take your time with each sense. This interrupts stress responses and grounds you in the present.`,
    duration_minutes: 5,
    difficulty_level: 'beginner',
    evidence_base: 'Grounding techniques activate the prefrontal cortex and reduce amygdala activation during stress.'
  },
  {
    id: 'mindful-003',
    name: 'Mindful Moment (STOP)',
    description: 'A brief pause to cultivate present-moment awareness anywhere, anytime.',
    category: 'mindfulness',
    instructions: `STOP technique:

S - STOP what you're doing
T - TAKE a breath (one slow, deep breath)
O - OBSERVE your experience:
    - What thoughts are present?
    - What emotions do you notice?
    - What sensations are in your body?
P - PROCEED with awareness

Practice this several times throughout your day.`,
    duration_minutes: 1,
    difficulty_level: 'beginner',
    evidence_base: 'Brief mindfulness practices accumulated throughout the day reduce stress and improve emotional regulation.'
  },
  {
    id: 'mindful-004',
    name: 'Loving-Kindness Meditation',
    description: 'Cultivate feelings of warmth and goodwill toward yourself and others.',
    category: 'mindfulness',
    instructions: `1. Sit comfortably and close your eyes
2. Begin with yourself. Repeat silently:
   "May I be happy. May I be healthy. May I be safe. May I live with ease."
   
3. Think of someone you love. Direct the phrases to them.
   
4. Think of a neutral person. Repeat the phrases.

5. Think of someone difficult. Offer them the same wishes.

6. Expand to all beings everywhere.`,
    duration_minutes: 10,
    difficulty_level: 'intermediate',
    evidence_base: 'Loving-kindness meditation increases positive emotions, social connection, and compassion.'
  },
  {
    id: 'mindful-005',
    name: 'Awe Walk',
    description: 'A walking practice designed to shift attention outward and cultivate wonder.',
    category: 'mindfulness',
    instructions: `1. Go for a walk somewhere - familiar or new
2. Walk slowly and intentionally
3. Try to see things with fresh eyes, as if for the first time
4. Look for things that are:
   - Vast (sky, trees, buildings)
   - Intricate (leaves, patterns, textures)
   - Beautiful or surprising
5. When you notice something awe-inspiring, pause and take it in
6. Let go of your phone and usual thoughts`,
    duration_minutes: 15,
    difficulty_level: 'beginner',
    evidence_base: 'Research shows awe walks increase positive emotions and decrease anxiety compared to regular walks.'
  },

  // POSITIVE PSYCHOLOGY / GRATITUDE (7)
  {
    id: 'positive-001',
    name: 'Three Good Things',
    description: 'Identify and reflect on three positive experiences from your day.',
    category: 'positive_psychology',
    instructions: `1. At the end of your day, write down three good things that happened
2. For each, answer: Why did this happen? What does it mean to you?
3. Notice how you feel after reflecting

Examples: A successful call, a kind word from a colleague, a moment of connection with family.`,
    duration_minutes: 5,
    difficulty_level: 'beginner',
    evidence_base: 'Developed by Martin Seligman, this exercise increases happiness and decreases depression for up to 6 months.'
  },
  {
    id: 'positive-002',
    name: 'Gratitude Letter',
    description: 'Write a heartfelt letter of appreciation to someone who impacted your life.',
    category: 'positive_psychology',
    instructions: `1. Think of someone who made a positive difference in your life
2. Write a letter (300+ words) describing:
   - What they did for you
   - How it affected your life
   - Why you are grateful
3. Consider reading it to them in person or sending it
4. Reflect on how writing made you feel`,
    duration_minutes: 15,
    difficulty_level: 'intermediate',
    evidence_base: 'Gratitude letters produce the largest short-term happiness boost of any positive psychology intervention.'
  },
  {
    id: 'positive-003',
    name: 'Gratitude Visit',
    description: 'Deliver your gratitude letter in person for maximum impact.',
    category: 'positive_psychology',
    instructions: `1. Write a gratitude letter to someone important
2. Contact the person and arrange to meet
3. When you meet, read your letter aloud to them
4. Allow space for their response
5. Discuss the memories and feelings that come up
6. Reflect afterward on the experience

Note: A video call works too if meeting in person isn't possible.`,
    duration_minutes: 30,
    difficulty_level: 'advanced',
    evidence_base: 'Gratitude visits produce immediate and lasting increases in happiness.'
  },
  {
    id: 'positive-004',
    name: 'Best Possible Self',
    description: 'Visualize and write about your ideal future to increase optimism.',
    category: 'positive_psychology',
    instructions: `1. Imagine your life 5-10 years from now
2. Everything has gone as well as possible - you've achieved your goals
3. Write in detail about this best possible future:
   - What does your work life look like?
   - What are your relationships like?
   - What is your health and wellbeing?
   - What have you accomplished?
4. Write for at least 15 minutes
5. Consider: What one step could you take today toward this vision?`,
    duration_minutes: 20,
    difficulty_level: 'intermediate',
    evidence_base: 'Best Possible Self writing increases optimism, positive affect, and goal motivation.'
  },
  {
    id: 'positive-005',
    name: 'Savoring Walk',
    description: 'A mindful walk focused on noticing and appreciating positive experiences.',
    category: 'positive_psychology',
    instructions: `1. Go for a 20-minute walk
2. Focus on savoring pleasant experiences:
   - Notice beauty around you
   - Take in pleasant sounds
   - Feel the air on your skin
3. When you notice something positive:
   - Pause and take it in
   - Take a mental photograph
   - Name what you appreciate
4. End by reflecting on 3 things you savored`,
    duration_minutes: 20,
    difficulty_level: 'beginner',
    evidence_base: 'Savoring practices extend positive experiences, increasing overall wellbeing.'
  },
  {
    id: 'positive-006',
    name: 'Positive Reminiscence',
    description: 'Revisit and relive positive memories to boost current mood.',
    category: 'positive_psychology',
    instructions: `1. Choose a positive memory from your past
   - A meaningful achievement
   - A wonderful experience
   - A moment of connection

2. Close your eyes and revisit it in detail:
   - Where were you?
   - Who was there?
   - What were the sights, sounds, smells?

3. Let yourself re-experience the positive feelings

4. Write about the memory for 10 minutes`,
    duration_minutes: 15,
    difficulty_level: 'beginner',
    evidence_base: 'Positive reminiscence increases positive affect and life satisfaction.'
  },
  {
    id: 'positive-007',
    name: 'Acts of Kindness',
    description: 'Perform intentional acts of kindness to boost happiness.',
    category: 'positive_psychology',
    instructions: `Plan and perform 3-5 acts of kindness today:

Ideas:
- Buy coffee for a colleague
- Send an encouraging text
- Give a genuine compliment
- Help someone with a task
- Call a family member just to say hello
- Leave a generous tip

After each act:
- Notice how you feel
- Observe the other person's reaction

At the end of the day, reflect on the experience.`,
    duration_minutes: 30,
    difficulty_level: 'beginner',
    evidence_base: 'Performing acts of kindness increases happiness, especially when varied and intentional.'
  },

  // STRENGTHS (2)
  {
    id: 'strengths-001',
    name: 'Signature Strengths',
    description: 'Identify and use your top character strengths in new ways.',
    category: 'strengths',
    instructions: `1. Take the free VIA Character Strengths Survey at viacharacter.org

2. Review your top 5 signature strengths

3. For each strength, reflect:
   - How does this strength show up in my life?
   - When do I feel most alive using it?

4. Choose ONE strength to use in a NEW way today

Examples:
- Creativity: Solve a problem in an unusual way
- Kindness: Perform a secret good deed
- Bravery: Speak up about something important

5. Notice how it feels to use your strength intentionally`,
    duration_minutes: 15,
    difficulty_level: 'intermediate',
    evidence_base: 'Using signature strengths in new ways is one of the most effective interventions for increasing happiness.'
  },
  {
    id: 'strengths-002',
    name: 'Strengths Spotting',
    description: 'Practice identifying character strengths in yourself and others.',
    category: 'strengths',
    instructions: `Today, become a "strengths detective":

1. SELF-SPOTTING: Notice when you use your strengths
   - What strength did you use?
   - How did it feel?

2. SPOTTING IN OTHERS: Look for strengths in colleagues, family
   - Tell someone about a strength you see in them

3. REFLECTION: At the end of the day, write down:
   - 3 strengths you used today
   - 3 strengths you saw in others

Common strengths: Bravery, Kindness, Teamwork, Fairness, Humor, Perseverance, Creativity, Curiosity, Love`,
    duration_minutes: 10,
    difficulty_level: 'beginner',
    evidence_base: 'Strengths spotting increases self-awareness and improves relationships.'
  },

  // RECOVERY (3)
  {
    id: 'recovery-001',
    name: 'Sleep Hygiene Protocol',
    description: 'Establish routines and environment for better quality sleep.',
    category: 'recovery',
    instructions: `Evening Routine (1-2 hours before bed):
1. Dim lights and reduce screen time
2. Avoid caffeine after 2pm
3. Set room temperature to 65-68°F
4. Use blackout curtains or eye mask
5. Practice relaxation technique
6. Keep consistent sleep/wake times

For shift workers: Use blackout curtains, maintain routine even on days off.`,
    duration_minutes: 15,
    difficulty_level: 'beginner',
    evidence_base: 'Good sleep hygiene improves sleep quality, cognitive function, and emotional regulation.'
  },
  {
    id: 'recovery-002',
    name: 'Post-Shift Decompression',
    description: 'A structured routine to transition from work to personal life.',
    category: 'recovery',
    instructions: `1. Physical transition: Change out of uniform, shower
2. Mental transition (10 min):
   - 5 minutes tactical breathing
   - Review: What went well today?
   - Set intention: What do you want from your off-duty time?
3. Create separation: Avoid discussing difficult calls immediately
4. Engage in a pleasant activity before sleep
5. If needed, schedule time tomorrow to process with peer support`,
    duration_minutes: 15,
    difficulty_level: 'beginner',
    evidence_base: 'Decompression routines reduce rumination and improve sleep.'
  },
  {
    id: 'recovery-003',
    name: 'Micro-Recovery Breaks',
    description: 'Short strategic breaks throughout the day to maintain energy.',
    category: 'recovery',
    instructions: `Every 90-120 minutes, take a 5-10 minute recovery break:

PHYSICAL:
- Stand and stretch
- Walk around
- Get water
- Do 10 deep breaths

MENTAL:
- Look away from screens
- Step outside if possible
- Practice a brief mindfulness moment

SOCIAL:
- Brief positive interaction with a colleague

Set reminders if needed. Even 2-3 minute breaks help!`,
    duration_minutes: 5,
    difficulty_level: 'beginner',
    evidence_base: 'Regular recovery breaks improve focus and prevent burnout.'
  },

  // COGNITIVE (4)
  {
    id: 'cognitive-001',
    name: 'Values Clarification',
    description: 'Identify your core values to guide decision-making.',
    category: 'cognitive',
    instructions: `1. Review common values: Family, Service, Integrity, Courage, Health, Growth, Connection, Justice, Security, Adventure
2. Select your top 5 most important values
3. Rank them in order of priority
4. For each, write:
   - Why this value matters to you
   - How you currently honor this value
   - One way to better align with this value
5. Reflect: Are you living in accordance with your values?`,
    duration_minutes: 15,
    difficulty_level: 'intermediate',
    evidence_base: 'Values clarification increases motivation and life satisfaction.'
  },
  {
    id: 'cognitive-002',
    name: 'Cognitive Reframing',
    description: 'Challenge unhelpful thought patterns into balanced perspectives.',
    category: 'cognitive',
    instructions: `1. Identify the triggering situation
2. Notice your automatic thought
3. Identify the emotion and rate its intensity (0-100)
4. Ask challenging questions:
   - What evidence supports this thought?
   - What evidence contradicts it?
   - What would I tell a colleague thinking this?
   - What is a more balanced way to see this?
5. Rate your emotion again after reframing`,
    duration_minutes: 10,
    difficulty_level: 'intermediate',
    evidence_base: 'Cognitive restructuring is a core component of CBT, one of the most evidence-based treatments.'
  },
  {
    id: 'cognitive-003',
    name: 'Purpose Reflection',
    description: 'Connect with your sense of meaning and purpose in life and work.',
    category: 'cognitive',
    instructions: `Reflect on and write about:

1. WHY did you choose your profession?
   - What drew you to this work?

2. WHAT gives your work meaning?
   - When do you feel most fulfilled?

3. WHO are you serving?
   - Think of specific people you've helped

4. HOW does your work connect to your values?

5. Write a personal "purpose statement" (1-2 sentences) that captures why your work matters.`,
    duration_minutes: 20,
    difficulty_level: 'intermediate',
    evidence_base: 'Connecting with purpose increases job satisfaction and protects against burnout.'
  },
  {
    id: 'cognitive-004',
    name: 'Legacy Letter',
    description: 'Write about the impact you want to have and how you want to be remembered.',
    category: 'cognitive',
    instructions: `Write a letter to be read by those closest to you.

1. What do you want them to know about:
   - What mattered most to you
   - The values you lived by
   - The lessons you learned

2. What wisdom would you share about:
   - Living a good life
   - Facing challenges
   - What truly matters

3. How do you want to be remembered?

4. Read what you wrote. Are you living toward this legacy now?`,
    duration_minutes: 25,
    difficulty_level: 'advanced',
    evidence_base: 'Legacy work increases sense of meaning and motivates value-aligned action.'
  },

  // CONNECTION (2)
  {
    id: 'connection-001',
    name: 'Meaningful Conversation',
    description: 'Have a deeper conversation that builds genuine connection.',
    category: 'connection',
    instructions: `Move beyond small talk:

1. CHOOSE someone - colleague, friend, family member

2. ASK deeper questions like:
   - "What's been on your mind lately?"
   - "What are you looking forward to?"
   - "What's challenging you right now?"

3. LISTEN actively:
   - Put away your phone
   - Ask follow-up questions
   - Don't jump to problem-solving

4. SHARE something genuine about yourself too

5. APPRECIATE the conversation - thank them for sharing`,
    duration_minutes: 15,
    difficulty_level: 'beginner',
    evidence_base: 'Meaningful conversations are more strongly linked to happiness than small talk.'
  },
  {
    id: 'connection-002',
    name: 'Active Constructive Responding',
    description: 'Learn to respond to good news in ways that strengthen relationships.',
    category: 'connection',
    instructions: `When someone shares good news:

ACTIVE CONSTRUCTIVE (Do this!):
- Show enthusiasm
- Ask questions about the event
- Relive the experience with them
- "That's wonderful! Tell me more!"

AVOID:
- Passive: "That's nice" (underwhelming)
- Destructive: "But what about..." (finding problems)

Practice today:
1. When someone shares something positive
2. Give them your full attention
3. Respond with genuine enthusiasm
4. Ask at least 2 follow-up questions`,
    duration_minutes: 10,
    difficulty_level: 'beginner',
    evidence_base: 'Active constructive responding is linked to greater relationship satisfaction.'
  },
]

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Sparkles, color: 'text-accent-400', bgColor: 'bg-accent-500/20' },
  { id: 'stress_management', name: 'Stress Management', icon: Wind, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { id: 'mindfulness', name: 'Mindfulness', icon: Brain, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { id: 'positive_psychology', name: 'Gratitude & Positivity', icon: Heart, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  { id: 'strengths', name: 'Strengths', icon: Star, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  { id: 'recovery', name: 'Recovery', icon: Moon, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
  { id: 'cognitive', name: 'Cognitive', icon: Brain, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  { id: 'connection', name: 'Connection', icon: Users, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
]

interface Completion {
  id: string
  intervention_id: string
  completed_at: string
  duration_seconds: number
  notes: string | null
}

export default function InterventionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeIntervention, setActiveIntervention] = useState<Intervention | null>(null)
  const [completions, setCompletions] = useState<Completion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerTarget, setTimerTarget] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setIsClient(true)
    fetchCompletions()
  }, [])

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerRunning])

  const fetchCompletions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('intervention_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
      if (error) throw error
      setCompletions(data || [])
    } catch (error) {
      console.error('Error fetching completions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startIntervention = (intervention: Intervention) => {
    setActiveIntervention(intervention)
    setTimerSeconds(0)
    setTimerTarget(intervention.duration_minutes * 60)
    setTimerRunning(false)
  }

  const toggleTimer = () => setTimerRunning(!timerRunning)
  const resetTimer = () => { setTimerRunning(false); setTimerSeconds(0) }

  const completeIntervention = () => {
    setTimerRunning(false)
    setShowCompletionModal(true)
  }

  const saveCompletion = async () => {
    if (!activeIntervention) return
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('intervention_completions').insert([{
        user_id: user.id,
        intervention_id: activeIntervention.id,
        intervention_name: activeIntervention.name,
        duration_seconds: timerSeconds,
        notes: completionNotes || null,
      }])
      if (error) throw error
      setShowCompletionModal(false)
      setCompletionNotes('')
      setActiveIntervention(null)
      resetTimer()
      fetchCompletions()
    } catch (error) {
      console.error('Error saving completion:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const closeIntervention = () => {
    setActiveIntervention(null)
    setTimerRunning(false)
    setTimerSeconds(0)
    setShowCompletionModal(false)
    setCompletionNotes('')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCompletionCount = (id: string) => completions.filter(c => c.intervention_id === id).length
  const getLastCompletion = (id: string) => completions.find(c => c.intervention_id === id)
  const getCategoryConfig = (id: string) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0]

  const filteredInterventions = selectedCategory === 'all' ? INTERVENTIONS : INTERVENTIONS.filter(i => i.category === selectedCategory)
  const totalCompletions = completions.length
  const thisWeekCompletions = completions.filter(c => new Date(c.completed_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  const totalMinutes = Math.round(completions.reduce((acc, c) => acc + c.duration_seconds, 0) / 60)

  if (!isClient) return <div className="flex items-center justify-center h-[calc(100vh-120px)]"><Loader2 className="w-8 h-8 animate-spin text-accent-400" /></div>

  if (activeIntervention) {
    const category = getCategoryConfig(activeIntervention.category)
    const CategoryIcon = category.icon
    const progress = timerTarget > 0 ? Math.min((timerSeconds / timerTarget) * 100, 100) : 0

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 overflow-hidden">
          <div className="p-4 border-b border-tactical-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${category.bgColor}`}><CategoryIcon className={`w-5 h-5 ${category.color}`} /></div>
                <div>
                  <h2 className="font-semibold text-tactical-100">{activeIntervention.name}</h2>
                  <p className="text-xs text-tactical-500">{category.name} • {activeIntervention.duration_minutes} min</p>
                </div>
              </div>
              <button onClick={closeIntervention} className="p-2 hover:bg-tactical-800 rounded-lg transition-colors text-tactical-400"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-6 border-b border-tactical-800">
            <div className="text-center mb-4">
              <p className="text-5xl font-mono font-bold text-tactical-100 mb-2">{formatTime(timerSeconds)}</p>
              <p className="text-sm text-tactical-500">Target: {formatTime(timerTarget)}</p>
            </div>
            <div className="h-2 bg-tactical-800 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-accent-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={resetTimer} className="p-3 bg-tactical-800 hover:bg-tactical-700 rounded-full transition-colors text-tactical-400"><RotateCcw className="w-5 h-5" /></button>
              <button onClick={toggleTimer} className={`p-4 rounded-full transition-colors ${timerRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-accent-600 hover:bg-accent-700'} text-white`}>
                {timerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button onClick={completeIntervention} className="p-3 bg-green-600 hover:bg-green-700 rounded-full transition-colors text-white"><CheckCircle2 className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-sm font-medium text-tactical-300 mb-3">Instructions</h3>
            <div className="bg-tactical-800/50 rounded-lg p-4">
              <p className="text-tactical-200 whitespace-pre-wrap text-sm leading-relaxed">{activeIntervention.instructions}</p>
            </div>
            <div className="mt-4 p-4 bg-accent-600/10 rounded-lg border border-accent-500/20">
              <h4 className="text-xs font-medium text-accent-400 mb-1">Evidence Base</h4>
              <p className="text-xs text-tactical-400">{activeIntervention.evidence_base}</p>
            </div>
          </div>
        </div>
        {showCompletionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-tactical-900 border border-tactical-800 rounded-xl w-full max-w-md">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-400" /></div>
                <h2 className="text-xl font-bold text-tactical-100 mb-1">Great Work!</h2>
                <p className="text-tactical-400 text-sm mb-4">You completed {activeIntervention.name} in {formatTime(timerSeconds)}</p>
                <div className="text-left mb-4">
                  <label className="block text-sm font-medium text-tactical-300 mb-1">Notes (optional)</label>
                  <textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} placeholder="How did it feel?" rows={3} className="w-full px-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowCompletionModal(false)} className="flex-1 px-4 py-3 bg-tactical-800 hover:bg-tactical-700 text-tactical-300 rounded-lg transition-colors">Cancel</button>
                  <button onClick={saveCompletion} disabled={isSaving} className="flex-1 px-4 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-tactical-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                    {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-tactical-100">Interventions</h1>
        <p className="text-tactical-400 text-sm">Evidence-based exercises for wellbeing • {INTERVENTIONS.length} exercises</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4 text-center">
          <p className="text-2xl font-bold text-tactical-100">{totalCompletions}</p>
          <p className="text-xs text-tactical-400">Total Completed</p>
        </div>
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4 text-center">
          <p className="text-2xl font-bold text-tactical-100">{thisWeekCompletions}</p>
          <p className="text-xs text-tactical-400">This Week</p>
        </div>
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4 text-center">
          <p className="text-2xl font-bold text-tactical-100">{totalMinutes}</p>
          <p className="text-xs text-tactical-400">Total Minutes</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const count = cat.id === 'all' ? INTERVENTIONS.length : INTERVENTIONS.filter(i => i.category === cat.id).length
          return (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.id ? `${cat.bgColor} ${cat.color} border border-current` : 'bg-tactical-800 text-tactical-400 hover:text-tactical-200 border border-tactical-700'}`}>
              <Icon className="w-4 h-4" />{cat.name}<span className="text-xs opacity-60">({count})</span>
            </button>
          )
        })}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent-400" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredInterventions.map((intervention) => {
            const category = getCategoryConfig(intervention.category)
            const CategoryIcon = category.icon
            const completionCount = getCompletionCount(intervention.id)
            const lastCompletion = getLastCompletion(intervention.id)
            return (
              <div key={intervention.id} className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-5 hover:border-tactical-700 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${category.bgColor} flex-shrink-0`}><CategoryIcon className={`w-6 h-6 ${category.color}`} /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-tactical-100">{intervention.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${category.color}`}>{category.name}</span>
                      <span className="text-tactical-600">•</span>
                      <span className="text-xs text-tactical-500 flex items-center gap-1"><Clock className="w-3 h-3" />{intervention.duration_minutes} min</span>
                    </div>
                    <p className="text-sm text-tactical-400 mt-2 mb-4 line-clamp-2">{intervention.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-tactical-500">
                        {completionCount > 0 && <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-accent-400" />{completionCount}x</span>}
                        {lastCompletion && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(lastCompletion.completed_at).toLocaleDateString()}</span>}
                      </div>
                      <button onClick={() => startIntervention(intervention)} className="flex items-center gap-2 px-4 py-2 bg-accent-600/20 hover:bg-accent-600/30 text-accent-400 rounded-lg transition-colors text-sm">
                        <Play className="w-4 h-4" />Start
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
