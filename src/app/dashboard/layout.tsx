'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◉' },
  { href: '/dashboard/coach', label: 'AI Coach', icon: '◈' },
  { href: '/dashboard/goals', label: 'Goals', icon: '◎' },
  { href: '/dashboard/journal', label: 'Journal', icon: '▤' },
  { href: '/dashboard/assessments', label: 'Assessments', icon: '◇' },
  { href: '/dashboard/nucalm', label: 'NuCalm', icon: '∿' },
  { href: '/dashboard/interventions', label: 'Interventions', icon: '✦' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-tactical-950">
      {/* Header */}
      <header className="h-16 bg-tactical-900/90 backdrop-blur-md border-b border-tactical-800 sticky top-0 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-10 h-10 text-accent-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.47-3.07 8.67-7 9.77-3.93-1.1-7-5.3-7-9.77V6.3l7-3.12z"/>
                <path d="M12 6l-4 1.8v3.2c0 2.68 1.84 5.2 4 5.87 2.16-.67 4-3.19 4-5.87V7.8L12 6z" opacity="0.6"/>
              </svg>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-tactical-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-accent-400">GUARDIAN</span>
                <span className="text-tactical-300 font-medium ml-1.5">Wellness</span>
              </h1>
              <p className="text-[10px] text-tactical-500 tracking-widest uppercase">Officer Support System</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-tactical-800/50 rounded-lg border border-tactical-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-tactical-400">Session Active</span>
            </div>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 text-sm text-tactical-400 hover:text-tactical-100 hover:bg-tactical-800 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 sticky top-16 h-[calc(100vh-64px)] bg-tactical-900/50 border-r border-tactical-800">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-accent-600/20 text-accent-400 border border-accent-500/30' 
                      : 'text-tactical-400 hover:text-tactical-100 hover:bg-tactical-800/50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-tactical-900/95 backdrop-blur-md border-t border-tactical-800 z-50">
          <nav className="flex justify-around p-2">
            {navItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
                    isActive ? 'text-accent-400' : 'text-tactical-500'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 tactical-grid min-h-[calc(100vh-64px)] pb-24 md:pb-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}