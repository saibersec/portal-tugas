'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  ShieldAlert
} from 'lucide-react'

interface Task {
  id: string
  title: string
  teacher_name: string
  deadline: string
  assigned_at: string
  subjects?: { name: string }
  classes?: { name: string }
}

interface ClassItem {
  id: string
  name: string
}

interface SubjectItem {
  id: string
  name: string
}

export default function StudentHomePage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Mengambil daftar tugas dari Supabase
      const { data: taskData } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          teacher_name,
          deadline,
          assigned_at,
          subjects ( name ),
          classes ( name )
        `)
        .order('deadline', { ascending: true })

      // Mengambil data Kelas & Mata Pelajaran untuk opsi Filter
      const { data: classData } = await supabase.from('classes').select('id, name')
      const { data: subjectData } = await supabase.from('subjects').select('id, name')

      if (taskData) setTasks(taskData as unknown as Task[])
      if (classData) setClasses(classData)
      if (subjectData) setSubjects(subjectData)

      setLoading(false)
    }

    fetchData()
  }, [])

  // Logika Penyaringan (Filter & Search)
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesClass = selectedClass === '' || task.classes?.name === selectedClass
    const matchesSubject = selectedSubject === '' || task.subjects?.name === selectedSubject

    return matchesSearch && matchesClass && matchesSubject
  })

  // Format Tanggal Indonesia
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Label Status (Aktif, Mendekati Deadline, Waktu Habis)
  const getStatusBadge = (deadlineStr: string) => {
    const now = new Date()
    const deadline = new Date(deadlineStr)
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" /> Waktu Habis
        </span>
      )
    } else if (diffHours <= 24) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3 mr-1" /> Segera Berakhir
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Aktif
        </span>
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navbar / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Portal Tugas Sekolah</h1>
              <p className="text-xs text-slate-500">Info Tugas & PR Resmi untuk Siswa</p>
            </div>
          </div>
          
          <a 
            href="/admin/dashboard" 
            className="flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Portal Admin</span>
          </a>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Banner Ucapan Selamat Datang */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Selamat Datang, Siswa! 📚</h2>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl">
            Cek seluruh daftar tugas dan PR sekolah di sini. Gunakan pencarian atau filter kelas untuk menemukan tugasmu dengan mudah.
          </p>
        </div>

        {/* Baris Pencarian & Filter */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          
          {/* Input Cari */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari judul tugas atau nama guru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          {/* Filter Pilih Mata Pelajaran */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-auto border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Semua Mapel</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.name}>{sub.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Daftar Kartu Tugas */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-slate-500">Memuat data tugas...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
            <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-semibold text-slate-700">Tidak ada tugas ditemukan</h3>
            <p className="text-sm text-slate-500 mt-1">Coba ubah kata kunci pencarian atau ganti pilihan filter kelas/mapel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Badge Mapel & Status */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                      {task.subjects?.name || 'Mata Pelajaran'}
                    </span>
                    {getStatusBadge(task.deadline)}
                  </div>

                  {/* Judul Tugas */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {task.title}
                  </h3>
                </div>

                {/* Detail Tugas */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-400 text-xs" />
                    <span>Guru: <strong className="text-slate-800">{task.teacher_name}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Batas Waktu: <strong className="text-slate-800">{formatDate(task.deadline)}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}