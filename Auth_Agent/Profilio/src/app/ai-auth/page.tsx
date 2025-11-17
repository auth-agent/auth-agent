import { redirect } from 'next/navigation'

export default function AuthAgentIndexPage() {
  redirect('/ai-auth/login')
}
