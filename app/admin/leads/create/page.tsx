"use client"

import { AdminLayout } from '@/components/layout/AdminLayout'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiPost } from '@/lib/api'

export default function CreateLeadPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', message: '', source: 'site', status: 'new' as const
  })

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await apiPost('/leads', form as unknown as Record<string, unknown>)
      router.push('/leads')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout title="Novo Lead" subtitle="Cadastrar lead manualmente">
      <div className="p-6">
        <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-soft p-6 max-w-xl grid gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700">Nome</label>
            <input name="name" value={form.name} onChange={onChange} required className="mt-1 w-full border border-secondary-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} required className="mt-1 w-full border border-secondary-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700">Telefone</label>
            <input name="phone" value={form.phone} onChange={onChange} required className="mt-1 w-full border border-secondary-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700">Origem</label>
            <select name="source" value={form.source} onChange={onChange} className="mt-1 w-full border border-secondary-300 rounded-md px-3 py-2">
              <option value="site">Site</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="google">Google</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700">Status</label>
            <select name="status" value={form.status} onChange={onChange} className="mt-1 w-full border border-secondary-300 rounded-md px-3 py-2">
              <option value="new">Novo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700">Mensagem</label>
            <textarea name="message" value={form.message} onChange={onChange} rows={4} className="mt-1 w-full border border-secondary-300 rounded-md px-3 py-2" />
          </div>
          {error && <p className="text-sm text-danger-600">{error}</p>}
          <div className="flex items-center gap-3 mt-2">
            <button disabled={isSubmitting} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" onClick={() => router.push('/leads')} className="px-4 py-2 border border-secondary-300 rounded-md hover:bg-secondary-50">Cancelar</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
