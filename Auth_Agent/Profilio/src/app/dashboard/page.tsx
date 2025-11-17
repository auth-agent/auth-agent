import AuthGuard from '@/components/auth/AuthGuard'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardClient />
    </AuthGuard>
  )
} 