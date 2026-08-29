import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import DeleteButton from './DeleteButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function KelolaTugasPage() {
  const supabase = await createClient()

  // 1. Ambil seluruh data tugas
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .order('assigned_at', { ascending: false })

  // 2. Ambil data mata pelajaran
  const { data: subjectsData } = await supabase
    .from('subjects')
    .select('id, name')

  const subjectMap = new Map(subjectsData?.map((s) => [s.id, s.name]) || [])
  const tasks = tasksData || []

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Tugas</h1>
          <p className="text-sm text-gray-500">Daftar semua tugas dan PR yang telah diberikan.</p>
        </div>
        <Link
          href="/admin/tugas/tambah"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-widest rounded-lg transition"
        >
          <Plus className="h-4 w-4 mr-1" /> Tambah Tugas
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Belum ada tugas. Klik "Tambah Tugas" untuk membuat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-400 font-medium">
                <tr>
                  <th className="px-6 py-3">Mata Pelajaran</th>
                  <th className="px-6 py-3">Judul Tugas</th>
                  <th className="px-6 py-3">Deadline</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {subjectMap.get(task.subject_id) || '-'}
                    </td>
                    <td className="px-6 py-4">{task.title}</td>
                    <td className="px-6 py-4">{formatDate(task.deadline)}</td>
                    <td className="px-6 py-4 text-right">
                      <DeleteButton id={task.id} />
                    </td>
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