'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, BookOpen, Clock, ShieldCheck, Loader2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  deadline: string
  assigned_at: string
  subject_id: string
}

interface Subject {
  id: string
  name: string
}

export default function StudentPortal() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('ALL')

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      
      const [{ data: tasksData }, { data: subjectsData }] = await Promise.all([
        supabase.from('tasks').select('*').order('assigned_at', { ascending: false }),
        supabase.from('subjects').select('id, name')
      ])

      if (tasksData) setTasks(tasksData)
      if (subjectsData) setSubjects(subjectsData)

      setIsLoading(false)
    }

    loadData()
  }, [])

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]))

  // Filter tugas berdasarkan judul dan mata pelajaran
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === 'ALL' || task.subject_id === selectedSubject
    return matchesSearch && matchesSubject
  })

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Portal Tugas Sekolah</h1>
              <p className="text-xs text-gray-500">Info Tugas & PR Resmi untuk Siswa</p>
            </div>
          </div>
          <Link
            href="/admin/login"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-lg transition"
          >
            <ShieldCheck className="h-4 w-4 mr-1.5" /> Portal Admin
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Banner Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10">
          <h2 className="text-2xl font-bold mb-2">Selamat Datang, Siswa! 👋</h2>
          <p className="text-blue-100 text-sm max-w-xl">
            Cek seluruh daftar tugas dan PR sekolah di sini. Gunakan pencarian atau filter mata pelajaran untuk menemukan tugasmu dengan mudah.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">Semua Mapel</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Task Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center space-y-3 shadow-sm">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Tidak ada tugas ditemukan</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Coba ubah kata kunci pencarian atau ganti pilihan filter mapel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const isOverdue = task.deadline && new Date(task.deadline) <= new Date()
              return (
                <div
                  key={task.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-md">
                        {subjectMap.get(task.subject_id) || 'Mata Pelajaran'}
                      </span>
                      {isOverdue && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 bg-red-50 rounded">
                          Lewat Deadline
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug">
                      {task.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span>Deadline: {formatDate(task.deadline)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}