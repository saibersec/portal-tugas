'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

interface Subject {
  id: string
  name: string
}

export default function TambahTugas() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const [subjects, setSubjects] = useState<Subject[]>([])

  const [formData, setFormData] = useState({
    title: '',
    deadline: '',
    subject_id: ''
  })

  useEffect(() => {
    async function fetchData() {
      setIsFetching(true)
      const { data: subjectData } = await supabase.from('subjects').select('id, name')

      if (subjectData && subjectData.length > 0) {
        setSubjects(subjectData)
        setFormData((prev) => ({ ...prev, subject_id: subjectData[0].id }))
      }
      setIsFetching(false)
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject_id) {
      alert('Mata pelajaran belum tersedia/dipilih.')
      return
    }

    setIsLoading(true)

    const { error } = await supabase
      .from('tasks')
      .insert([
        { 
          title: formData.title, 
          deadline: formData.deadline,
          subject_id: formData.subject_id,
          teacher_name: '-', // Mengisi otomatis agar tidak bentrok dengan not-null constraint database
          assigned_at: new Date().toISOString()
        }
      ])

    if (error) {
      alert('Gagal menambahkan tugas: ' + error.message)
      setIsLoading(false)
    } else {
      router.push('/admin/tugas')
      router.refresh()
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link 
          href="/admin/tugas"
          className="text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tambah Tugas Baru</h2>
          <p className="mt-1 text-sm text-gray-500">Silakan isi detail tugas di bawah ini.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tugas</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contoh: Mengerjakan LKS Hal 10-15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
            <select
              required
              value={formData.subject_id}
              onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu (Deadline)</label>
            <input 
              type="datetime-local" 
              required
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isLoading ? 'Menyimpan...' : 'Simpan Tugas'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  )
}