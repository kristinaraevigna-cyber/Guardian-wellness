'use client'

import { useState, useEffect } from 'react'
import { 
  BookOpen,
  Brain,
  Heart,
  Moon,
  Shield,
  Users,
  Zap,
  Compass,
  Sparkles,
  ChevronRight,
  X,
  Clock,
  CheckCircle2,
  Star,
  Search,
  GraduationCap
} from 'lucide-react'

// ============================================
// WELLBEING LITERACY LIBRARY
// ============================================

interface Article {
  id: string
  title: string
  description: string
  category: string
  readTime: number
  content: string
  keyTakeaways: string[]
  references?: string[]
}

const ARTICLES: Article[] = [
  // STRESS & RESILIENCE
  {
    id: 'stress-101',
    title: 'Understanding the Stress Response',
    description: 'Learn how your body responds to stress and why this knowledge is power.',
    category: 'stress_resilience',
    readTime: 5,
    content: `## What Happens When You're Stressed

When you encounter a perceived threat—whether it's a dangerous situation or a difficult conversation—your brain triggers a cascade of physiological changes known as the **stress response** or "fight-flight-freeze" response.

### The Brain's Alarm System

The **amygdala**, your brain's alarm center, detects threats and signals the hypothalamus to activate the sympathetic nervous system. This triggers the release of stress hormones:

- **Adrenaline (Epinephrine)**: Increases heart rate, blood pressure, and energy
- **Cortisol**: Mobilizes glucose for energy and suppresses non-essential functions

### Physical Changes

Within seconds, your body prepares for action:
- Heart rate increases
- Breathing becomes rapid and shallow
- Muscles tense
- Digestion slows
- Senses sharpen

### The Problem with Chronic Stress

This response is designed for short-term threats. When stress becomes chronic:
- Elevated cortisol damages memory and learning
- Immune function is suppressed
- Sleep is disrupted
- Emotional regulation becomes harder

### The Good News

Understanding your stress response is the first step to managing it. Techniques like tactical breathing work because they directly activate the **parasympathetic nervous system**—your body's "rest and digest" mode—counteracting the stress response.

Your nervous system is trainable. Regular practice of stress management techniques builds resilience over time.`,
    keyTakeaways: [
      'The stress response is automatic and designed to protect you',
      'Chronic stress has negative effects on brain and body',
      'Breathing techniques can directly counteract the stress response',
      'Resilience is trainable through regular practice'
    ],
    references: [
      'McEwen, B.S. (2007). Physiology and neurobiology of stress',
      'Sapolsky, R.M. (2004). Why Zebras Don\'t Get Ulcers'
    ]
  },
  {
    id: 'resilience-101',
    title: 'Building Psychological Resilience',
    description: 'The science of bouncing back from adversity and growing stronger.',
    category: 'stress_resilience',
    readTime: 6,
    content: `## What is Resilience?

Resilience is not about avoiding stress or being unaffected by difficulty. It's the ability to adapt and recover from challenges, and sometimes even grow stronger because of them.

### The Resilience Factors

Research identifies several factors that build resilience:

**1. Social Connection**
Strong relationships are the #1 predictor of resilience. Having people you can turn to for support makes a profound difference.

**2. Sense of Purpose**
People with a clear sense of meaning and purpose recover better from setbacks. Purpose provides motivation to persist.

**3. Self-Efficacy**
Belief in your ability to handle challenges matters. This builds through experience—each challenge you overcome increases confidence.

**4. Emotional Regulation**
The ability to manage intense emotions without being overwhelmed is trainable through practices like mindfulness.

**5. Cognitive Flexibility**
Being able to reframe situations and find alternative perspectives helps us adapt to changing circumstances.

### Building Your Resilience

Resilience isn't fixed—it's built through:

- **Daily practices**: Gratitude, mindfulness, exercise
- **Recovery habits**: Adequate sleep, decompression routines
- **Connection**: Maintaining supportive relationships
- **Challenge**: Gradually stretching your comfort zone
- **Reflection**: Learning from difficulties rather than just enduring them

### Post-Traumatic Growth

Research shows that many people don't just return to baseline after trauma—they experience growth. This can include:
- Greater appreciation for life
- Improved relationships
- Increased personal strength
- New possibilities
- Spiritual development

This doesn't minimize suffering, but shows that humans have remarkable capacity for growth.`,
    keyTakeaways: [
      'Resilience is trainable, not fixed',
      'Social connection is the strongest predictor of resilience',
      'Recovery and growth after adversity is possible',
      'Daily practices build resilience over time'
    ]
  },

  // SLEEP
  {
    id: 'sleep-101',
    title: 'The Science of Sleep',
    description: 'Why sleep matters more than you think and how to optimize it.',
    category: 'sleep',
    readTime: 7,
    content: `## Why Sleep Matters

Sleep isn't just rest—it's an active process essential for physical health, cognitive function, and emotional wellbeing.

### What Happens During Sleep

Sleep cycles through stages approximately every 90 minutes:

**Non-REM Sleep (Stages 1-3)**
- Stage 1: Light sleep, easily awakened
- Stage 2: Body temperature drops, heart rate slows
- Stage 3: Deep sleep, essential for physical restoration

**REM Sleep**
- Rapid eye movement, vivid dreams
- Memory consolidation and emotional processing
- Brain activity similar to waking

### Sleep and Performance

Inadequate sleep impairs:
- **Reaction time**: Similar to alcohol intoxication
- **Decision-making**: Especially under stress
- **Emotional regulation**: Lower threshold for anger, anxiety
- **Memory**: Both learning and recall
- **Physical recovery**: Muscle repair, immune function

### Sleep for Shift Workers

Shift work presents unique challenges:

**Strategies that help:**
- Maintain consistent sleep times when possible
- Use blackout curtains and eye masks
- Keep room cool (65-68°F)
- Limit caffeine 6+ hours before sleep
- Consider strategic napping (20-30 min)
- Discuss melatonin timing with your doctor

### Sleep Hygiene Essentials

1. **Consistency**: Same sleep/wake times daily
2. **Environment**: Dark, cool, quiet
3. **Wind-down routine**: 30-60 minutes before bed
4. **Limit screens**: Blue light suppresses melatonin
5. **Watch substances**: Caffeine, alcohol affect sleep quality
6. **Exercise**: Regular activity improves sleep (not too close to bedtime)`,
    keyTakeaways: [
      'Sleep is active restoration, not just rest',
      'Sleep deprivation significantly impairs performance',
      'Consistency is more important than duration',
      'Sleep environment and routines make a big difference'
    ]
  },

  // POSITIVE PSYCHOLOGY
  {
    id: 'positive-psych-101',
    title: 'Introduction to Positive Psychology',
    description: 'The science of wellbeing and what makes life worth living.',
    category: 'positive_psychology',
    readTime: 6,
    content: `## What is Positive Psychology?

Positive psychology is the scientific study of what makes life worth living. Rather than focusing only on dysfunction and disorder, it examines:

- What makes people flourish
- The nature of happiness and wellbeing
- Character strengths and virtues
- Positive emotions and experiences

### The PERMA Model

Dr. Martin Seligman identified five pillars of wellbeing:

**P - Positive Emotion**
Experiencing joy, gratitude, serenity, hope, and other positive feelings. These aren't just pleasant—they broaden thinking and build resources.

**E - Engagement**
Being fully absorbed in activities that use your skills. This "flow" state is intrinsically rewarding and builds competence.

**R - Relationships**
Positive relationships are essential for wellbeing. We are social beings who need connection, belonging, and love.

**M - Meaning**
Having a sense of purpose—belonging to and serving something larger than yourself.

**A - Accomplishment**
Pursuing achievement, mastery, and competence for their own sake.

### What Positive Psychology is NOT

- It's not "positive thinking" or ignoring problems
- It's not about being happy all the time
- It doesn't dismiss negative emotions
- It's evidence-based, not self-help platitudes

### Evidence-Based Practices

Research has validated several practices that increase wellbeing:
- Gratitude exercises (Three Good Things)
- Using signature strengths in new ways
- Acts of kindness
- Savoring positive experiences
- Mindfulness practices
- Building social connections`,
    keyTakeaways: [
      'Positive psychology is scientific, not just positive thinking',
      'PERMA: Positive emotion, Engagement, Relationships, Meaning, Accomplishment',
      'Wellbeing can be intentionally cultivated',
      'Evidence-based practices can significantly increase wellbeing'
    ]
  },
  {
    id: 'gratitude-science',
    title: 'The Science of Gratitude',
    description: 'Why gratitude is one of the most powerful wellbeing practices.',
    category: 'positive_psychology',
    readTime: 5,
    content: `## Why Gratitude Works

Gratitude isn't just polite—it's one of the most robust predictors of wellbeing across hundreds of studies.

### What Research Shows

Regular gratitude practice is associated with:
- **Higher life satisfaction and happiness**
- **Better sleep quality**
- **Reduced depression and anxiety**
- **Improved physical health**
- **Stronger relationships**
- **Increased resilience**

### How Gratitude Works

**Shifts Attention**
Our brains have a negativity bias—we naturally notice threats more than positives. Gratitude intentionally redirects attention to good things.

**Builds Resources**
Positive emotions from gratitude "broaden and build"—they expand our thinking and build lasting personal resources.

**Strengthens Relationships**
Expressing gratitude reinforces social bonds and makes others feel valued.

**Counters Adaptation**
We quickly adapt to good things and stop noticing them. Gratitude re-sensitizes us to positives in our lives.

### Effective Gratitude Practices

**Three Good Things** (most researched)
- Write 3 good things from your day
- Explain why each happened
- Do this daily for at least 1-2 weeks

**Gratitude Letter/Visit**
- Write a detailed letter to someone who helped you
- Deliver it in person if possible

**Mental Subtraction**
- Imagine your life without something you value
- Appreciate its presence more fully

### Making It Stick

- Be specific (not just "I'm grateful for my family")
- Vary your practice to avoid routine
- Focus on people, not just things
- Aim for depth over breadth`,
    keyTakeaways: [
      'Gratitude has robust scientific support for improving wellbeing',
      'It works by shifting attention and building resources',
      'Specific and varied gratitude is more effective',
      'Consistency matters—make it a regular practice'
    ]
  },

  // MINDFULNESS
  {
    id: 'mindfulness-101',
    title: 'Mindfulness Fundamentals',
    description: 'What mindfulness is, how it works, and why it matters.',
    category: 'mindfulness',
    readTime: 6,
    content: `## What is Mindfulness?

Mindfulness is **paying attention, on purpose, to the present moment, without judgment.**

It's not about emptying your mind or achieving a special state. It's about being aware of what's happening right now—thoughts, feelings, sensations—without getting lost in or fighting against them.

### The Science of Mindfulness

Brain imaging studies show mindfulness practice leads to:
- **Increased prefrontal cortex activity** (executive function, regulation)
- **Reduced amygdala reactivity** (less reactive to stress)
- **Strengthened attention networks**
- **Changes in default mode network** (less mind-wandering)

### Benefits of Regular Practice

**Mental Health**
- Reduced anxiety and depression
- Better emotional regulation
- Decreased rumination
- Improved stress management

**Cognitive Function**
- Enhanced attention and focus
- Improved working memory
- Better decision-making under pressure

**Physical Health**
- Lower blood pressure
- Reduced chronic pain
- Improved sleep
- Enhanced immune function

### Core Mindfulness Skills

**1. Focused Attention**
Concentrating on a single object (like breath) and returning when the mind wanders.

**2. Open Monitoring**
Observing whatever arises in awareness without attachment.

**3. Non-Judgmental Awareness**
Noticing experiences without labeling them good or bad.

### Getting Started

- Start small: Even 5 minutes daily builds the habit
- Use anchors: Breath, body sensations, sounds
- Expect distraction: Noticing and returning IS the practice
- Be patient: Benefits accumulate over weeks and months
- Consider guided practice: Apps and recordings can help`,
    keyTakeaways: [
      'Mindfulness is present-moment awareness without judgment',
      'It creates measurable changes in the brain',
      'Regular practice improves mental, cognitive, and physical health',
      'Start small and be patient—benefits build over time'
    ]
  },

  // PSYCHOLOGICAL CAPITAL
  {
    id: 'psycap-101',
    title: 'Psychological Capital: Your HERO Within',
    description: 'Understanding and building Hope, Efficacy, Resilience, and Optimism.',
    category: 'psycap',
    readTime: 6,
    content: `## What is Psychological Capital?

Psychological Capital (PsyCap) is a state-like resource that predicts performance, wellbeing, and resilience. Unlike fixed traits, PsyCap can be developed.

### The HERO Framework

**H - Hope**
Not wishful thinking, but having pathways to goals AND the willpower to pursue them.
- Goal-directed energy
- Multiple paths to objectives
- Flexibility when blocked

**E - Efficacy**
Confidence in your ability to succeed at specific tasks.
- Taking on challenges
- Putting in effort
- Persisting despite setbacks

**R - Resilience**
The capacity to bounce back from adversity.
- Recovering from setbacks
- Adapting to change
- Growing from difficulties

**O - Optimism**
A positive attributional style—viewing positive events as internal, permanent, and pervasive.
- Expecting good outcomes
- Taking credit for successes
- Viewing setbacks as temporary

### Why PsyCap Matters

Research shows higher PsyCap is associated with:
- Better job performance
- Higher job satisfaction
- Lower stress and anxiety
- Better physical health
- Stronger organizational commitment
- Lower turnover intentions

### Building Your PsyCap

**Hope**: Set meaningful goals, identify multiple pathways, anticipate obstacles

**Efficacy**: Master new challenges, observe others succeeding, receive encouragement

**Resilience**: Build resources before you need them, focus on what you can control, find meaning

**Optimism**: Challenge negative self-talk, savor successes, reframe setbacks as temporary`,
    keyTakeaways: [
      'PsyCap includes Hope, Efficacy, Resilience, and Optimism',
      'Unlike fixed traits, PsyCap can be developed',
      'Higher PsyCap predicts better performance and wellbeing',
      'Each HERO component can be intentionally strengthened'
    ]
  },

  // PURPOSE & MEANING
  {
    id: 'purpose-101',
    title: 'Finding Purpose and Meaning',
    description: 'Why purpose matters and how to cultivate it.',
    category: 'purpose',
    readTime: 7,
    content: `## The Power of Purpose

Having a sense of purpose—a sense that your life has meaning and direction—is one of the strongest predictors of wellbeing, health, and longevity.

### What Research Shows

People with a strong sense of purpose have:
- **Lower mortality risk** (even controlling for other factors)
- **Reduced risk of Alzheimer's disease**
- **Better cardiovascular health**
- **Lower inflammation markers**
- **Greater resilience to stress**
- **Higher life satisfaction**

### Purpose vs. Happiness

Purpose and happiness are related but distinct:

**Happiness** is about feeling good in the moment
**Purpose** is about meaning—believing your life matters

Sometimes purpose involves difficulty or sacrifice. Purpose can sustain you through challenges when happiness fades.

### Components of Purpose

Purpose typically involves:

**1. Significance**
A sense that your life and activities matter

**2. Direction**
Goals and intentions that guide your choices

**3. Beyond-the-Self**
Contributing to something larger than yourself

### Finding Your Purpose

Purpose isn't usually discovered in a flash—it's cultivated over time through:

**Reflection**
- What activities make you lose track of time?
- When do you feel most alive?
- What would you do if money weren't a concern?
- What problems do you want to solve?

**Exploration**
- Try new experiences
- Talk to people doing work that interests you
- Volunteer for causes you care about

**Connection**
- How can your strengths serve others?
- What needs in the world call to you?
- Who do you want to help?

### Purpose in Law Enforcement

First responders often have a built-in sense of purpose—service, protection, justice. Reconnecting with this "why" can sustain motivation through difficult times.`,
    keyTakeaways: [
      'Purpose is one of the strongest predictors of wellbeing and longevity',
      'Purpose involves significance, direction, and contribution beyond self',
      'Purpose is cultivated over time, not discovered instantly',
      'Reconnecting with your "why" sustains motivation through challenges'
    ]
  },

  // SOCIAL CONNECTION
  {
    id: 'connection-101',
    title: 'The Vital Importance of Social Connection',
    description: 'Why relationships are fundamental to health and wellbeing.',
    category: 'connection',
    readTime: 5,
    content: `## We Are Social Beings

Humans evolved as social creatures. Our brains are wired for connection—we need relationships to thrive.

### The Health Impact of Connection

Loneliness and social isolation are associated with:
- **26% increased risk of mortality** (comparable to smoking)
- **Higher rates of depression and anxiety**
- **Weakened immune function**
- **Increased inflammation**
- **Cognitive decline**

Strong relationships, conversely, are one of the most robust predictors of:
- Longevity
- Physical health
- Mental health
- Life satisfaction

### Quality Over Quantity

It's not about having many friends—it's about having meaningful connections:
- People who understand you
- Those you can turn to in difficulty
- Relationships with mutual care and support

### Connection for First Responders

The job creates unique relationship challenges:
- Shift work disrupts family time
- Difficult to discuss work with civilians
- Cumulative stress affects mood at home
- Tendency to isolate when struggling

**What helps:**
- Peer support from those who understand
- Protecting family time intentionally
- Transition rituals between work and home
- Open communication with partners
- Professional support when needed

### Building Connection

**Deepen existing relationships**
- Quality time without distractions
- Meaningful conversations
- Active listening
- Expressing appreciation

**Expand your network**
- Join groups aligned with interests
- Be open to new connections
- Maintain contact with supportive colleagues`,
    keyTakeaways: [
      'Social connection is fundamental to health—not optional',
      'Loneliness has health impacts comparable to smoking',
      'Quality of relationships matters more than quantity',
      'Connection requires intentional cultivation'
    ]
  },

  // EMOTIONAL INTELLIGENCE
  {
    id: 'eq-101',
    title: 'Understanding Emotional Intelligence',
    description: 'The skills that help you navigate emotions effectively.',
    category: 'emotional_intelligence',
    readTime: 6,
    content: `## What is Emotional Intelligence?

Emotional Intelligence (EQ) is the ability to recognize, understand, and manage emotions—in yourself and others. Unlike IQ, EQ can be significantly developed.

### The Four Domains

**1. Self-Awareness**
Recognizing your own emotions and their impact
- Noticing emotional triggers
- Understanding your patterns
- Recognizing how emotions affect behavior

**2. Self-Management**
Regulating emotions and adapting behavior
- Managing stress and impulses
- Staying flexible and positive
- Following through on commitments

**3. Social Awareness**
Understanding others' emotions and perspectives
- Empathy and perspective-taking
- Reading emotional cues
- Understanding group dynamics

**4. Relationship Management**
Using emotional intelligence to navigate relationships
- Communicating clearly
- Managing conflict
- Inspiring and influencing others

### Why EQ Matters

Research shows EQ predicts:
- Job performance (especially in leadership)
- Relationship quality
- Mental health
- Stress management
- Decision-making under pressure

### Building Emotional Intelligence

**Self-Awareness**
- Practice mindfulness
- Journal about emotions
- Seek feedback from others

**Self-Management**
- Develop stress management techniques
- Pause before reacting
- Identify and change unhelpful patterns

**Social Awareness**
- Practice active listening
- Notice nonverbal cues
- Ask about others' perspectives

**Relationship Management**
- Practice clear communication
- Address conflicts constructively
- Express appreciation regularly`,
    keyTakeaways: [
      'EQ includes self-awareness, self-management, social awareness, and relationship management',
      'Unlike IQ, emotional intelligence can be significantly developed',
      'EQ predicts success in many life domains',
      'Each domain can be strengthened through practice'
    ]
  },
]

const CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: BookOpen, color: 'text-accent-400', bgColor: 'bg-accent-500/20' },
  { id: 'stress_resilience', name: 'Stress & Resilience', icon: Shield, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { id: 'sleep', name: 'Sleep', icon: Moon, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
  { id: 'positive_psychology', name: 'Positive Psychology', icon: Sparkles, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  { id: 'mindfulness', name: 'Mindfulness', icon: Brain, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { id: 'psycap', name: 'Psychological Capital', icon: Zap, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  { id: 'purpose', name: 'Purpose & Meaning', icon: Compass, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  { id: 'connection', name: 'Connection', icon: Users, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  { id: 'emotional_intelligence', name: 'Emotional Intelligence', icon: Heart, color: 'text-red-400', bgColor: 'bg-red-500/20' },
]

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeArticle, setActiveArticle] = useState<Article | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [readArticles, setReadArticles] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem('guardian-read-articles')
    if (saved) setReadArticles(JSON.parse(saved))
  }, [])

  const markAsRead = (articleId: string) => {
    if (!readArticles.includes(articleId)) {
      const updated = [...readArticles, articleId]
      setReadArticles(updated)
      localStorage.setItem('guardian-read-articles', JSON.stringify(updated))
    }
  }

  const getCategoryConfig = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0]
  }

  const filteredArticles = ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (!isClient) return null

  // Article View
  if (activeArticle) {
    const category = getCategoryConfig(activeArticle.category)
    const CategoryIcon = category.icon

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-tactical-800">
            <div className="flex items-center justify-between">
              <button
                onClick={() => { markAsRead(activeArticle.id); setActiveArticle(null) }}
                className="flex items-center gap-2 text-tactical-400 hover:text-tactical-200 transition-colors"
              >
                ← Back to Library
              </button>
              <div className="flex items-center gap-2 text-xs text-tactical-500">
                <Clock className="w-3.5 h-3.5" />
                {activeArticle.readTime} min read
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${category.bgColor}`}>
                <CategoryIcon className={`w-5 h-5 ${category.color}`} />
              </div>
              <span className={`text-sm ${category.color}`}>{category.name}</span>
            </div>

            <h1 className="text-2xl font-bold text-tactical-100 mb-2">{activeArticle.title}</h1>
            <p className="text-tactical-400 mb-6">{activeArticle.description}</p>

            {/* Article Content */}
            <div className="prose prose-invert prose-sm max-w-none">
              {activeArticle.content.split('\n').map((paragraph, i) => {
                if (paragraph.startsWith('## ')) {
                  return <h2 key={i} className="text-xl font-bold text-tactical-100 mt-6 mb-3">{paragraph.replace('## ', '')}</h2>
                } else if (paragraph.startsWith('### ')) {
                  return <h3 key={i} className="text-lg font-semibold text-tactical-200 mt-4 mb-2">{paragraph.replace('### ', '')}</h3>
                } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return <p key={i} className="font-semibold text-tactical-200 mt-3">{paragraph.replace(/\*\*/g, '')}</p>
                } else if (paragraph.startsWith('- ')) {
                  return <li key={i} className="text-tactical-300 ml-4">{paragraph.replace('- ', '')}</li>
                } else if (paragraph.trim()) {
                  return <p key={i} className="text-tactical-300 mb-3 leading-relaxed">{paragraph}</p>
                }
                return null
              })}
            </div>

            {/* Key Takeaways */}
            <div className="mt-8 p-4 bg-accent-600/10 rounded-lg border border-accent-500/20">
              <h3 className="text-sm font-semibold text-accent-400 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {activeArticle.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-tactical-300">
                    <CheckCircle2 className="w-4 h-4 text-accent-400 mt-0.5 flex-shrink-0" />
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>

            {/* References */}
            {activeArticle.references && (
              <div className="mt-6 pt-6 border-t border-tactical-800">
                <h4 className="text-xs font-medium text-tactical-500 mb-2">References</h4>
                <ul className="space-y-1">
                  {activeArticle.references.map((ref, i) => (
                    <li key={i} className="text-xs text-tactical-600">{ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Library View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-tactical-100 flex items-center gap-3">
          <GraduationCap className="w-7 h-7 text-accent-400" />
          Wellbeing Library
        </h1>
        <p className="text-tactical-400 text-sm">Build your knowledge of wellbeing science</p>
      </div>

      {/* Progress */}
      <div className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-tactical-300">Reading Progress</span>
          <span className="text-sm text-accent-400">{readArticles.length} / {ARTICLES.length} articles</span>
        </div>
        <div className="h-2 bg-tactical-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${(readArticles.length / ARTICLES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tactical-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-3 bg-tactical-800 border border-tactical-700 rounded-lg text-tactical-100 placeholder-tactical-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const count = cat.id === 'all' ? ARTICLES.length : ARTICLES.filter(a => a.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? `${cat.bgColor} ${cat.color} border border-current`
                  : 'bg-tactical-800 text-tactical-400 hover:text-tactical-200 border border-tactical-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
              <span className="text-xs opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Articles Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredArticles.map((article) => {
          const category = getCategoryConfig(article.category)
          const CategoryIcon = category.icon
          const isRead = readArticles.includes(article.id)

          return (
            <button
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="bg-tactical-900/50 rounded-xl border border-tactical-800 p-5 hover:border-tactical-700 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${category.bgColor} flex-shrink-0`}>
                  <CategoryIcon className={`w-6 h-6 ${category.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-tactical-100 group-hover:text-accent-400 transition-colors">
                      {article.title}
                    </h3>
                    {isRead && (
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-tactical-400 mb-3 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-tactical-500">
                    <span className={category.color}>{category.name}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime} min
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-tactical-600 group-hover:text-tactical-400 transition-colors flex-shrink-0" />
              </div>
            </button>
          )
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 bg-tactical-900/50 rounded-xl border border-tactical-800">
          <BookOpen className="w-12 h-12 text-tactical-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-tactical-300 mb-1">No articles found</h3>
          <p className="text-tactical-500 text-sm">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  )
}
