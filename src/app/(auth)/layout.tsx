export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-tactical-950 tactical-grid">
      {children}
    </div>
  )
}