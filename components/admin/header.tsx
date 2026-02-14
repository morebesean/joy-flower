'use client'

import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AdminHeader() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex-1" />

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <User className="h-4 w-4" />
          <span>Admin</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={loading}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {loading ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </header>
  )
}
