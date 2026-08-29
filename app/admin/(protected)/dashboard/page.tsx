import { createClient } from '@/lib/supabase/server'
import { FileText, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic' // Memastikan data selalu segar

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Mengambil data tugas
  const { data: tasks } = await supabase.from('tasks').select('id, title, deadline, subjects(name)')
  
  // Menghitung statistik
  const totalTasks = tasks?.length || 0
  const now = new Date()
  
  let activeTasks = 0
  let overdueTasks = 0
  let todayDeadlineTasks = 0

  tasks?.forEach(task => {
    const deadlineDate = new Date(task.deadline)
    if (deadlineDate < now) {
      overdueTasks++
    } else {
      activeTasks++
      // Cek apakah deadline hari ini
      if (deadlineDate.toDateString() === now.toDateString()) {
        todayDeadlineTasks++
      }
    }
  })

  // Data 5 tugas terbaru
  const { data: recentTasks } = await supabase
    .from('tasks')
    .select('id, title, deadline, classes(name), subjects(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const statCards = [
    { title: 'Total Tugas', value: totalTasks, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Tugas Aktif', value: activeTasks, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Deadline Hari Ini', value: todayDeadlineTasks, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Terlambat', value: overdueTasks, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Ringkasan aktivitas tugas dan PR sekolah.</p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabel Tugas Terbaru */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Tugas Baru Ditambahkan</h3>
        </div>
        <div className="overflow-x-auto">
          {recentTasks && recentTasks.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Tugas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batas Waktu</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {/* @ts-ignore */}
                      {task.subjects?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* @ts-ignore */}
                      {task.classes?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-500 text-sm">
              Belum ada tugas yang ditambahkan.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}