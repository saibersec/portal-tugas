import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react'

// Memastikan data selalu di-fetch paling baru (tanpa cache)
export const revalidate = 0 

interface TaskItem {
  id: string
  title: string
  deadline: string
  assigned_at: string
  subjects?: { name: string } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Ambil data tugas beserta mata pelajaran saja (tanpa kelas)
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      deadline,
      assigned_at,
      subjects ( name )
    `)
    .order('assigned_at', { ascending: false })

  const taskList: TaskItem[] = tasks || []
  const totalTasks = taskList.length

  const now = new Date()

  // Hitung Tugas Aktif dan Terlambat
  const activeTasks = taskList.filter(t => new Date(t.deadline) > now).length
  const overdueTasks = taskList.filter(t => new Date(t.deadline) <= now).length

  // Hitung Deadline Hari Ini
  const todayStr = now.toISOString().split('T')[0]
  const deadlineToday = taskList.filter(t => {
    if (!t.deadline) return false
    return t.deadline.startsWith(todayStr)
  }).length

  const recentTasks = taskList.slice(0, 5)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Ringkasan aktivitas tugas dan PR sekolah.</p>
      </div>

      {/* Kartu Ringkasan Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Tugas</p>
            <h3 className="text-xl font-bold text-gray-900">{totalTasks}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Tugas Aktif</p>
            <h3 className="text-xl font-bold text-gray-900">{activeTasks}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Deadline Hari Ini</p>
            <h3 className="text-xl font-bold text-gray-900">{deadlineToday}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Terlambat</p>
            <h3 className="text-xl font-bold text-gray-900">{overdueTasks}</h3>
          </div>
        </div>
      </div>

      {/* Tabel Tugas Terbaru */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Tugas Baru Ditambahkan</h2>
          <Link
            href="/admin/tugas/tambah"
            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" /> Tambah Tugas
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Belum ada tugas yang ditambahkan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-400 font-medium">
                <tr>
                  <th className="px-6 py-3">Mata Pelajaran</th>
                  <th className="px-6 py-3">Judul Tugas</th>
                  <th className="px-6 py-3">Batas Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {task.subjects?.name || '-'}
                    </td>
                    <td className="px-6 py-4">{task.title}</td>
                    <td className="px-6 py-4">{formatDate(task.deadline)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}