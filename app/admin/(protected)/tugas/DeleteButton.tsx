'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')
    if (!confirmed) return

    setIsDeleting(true)
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      alert('Gagal menghapus tugas: ' + error.message)
      setIsDeleting(false)
    } else {
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md transition-colors"
      title="Hapus Tugas"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  )
}