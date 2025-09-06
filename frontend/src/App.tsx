import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'

type Category = { id: number; name: string }
type Note = {
  id: number
  title: string
  content?: string | null
  archived: boolean
  categories: { category: Category }[]
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function App() {
  const qc = useQueryClient()
  const [filterArchived, setFilterArchived] = useState(false)
  const [filterCategory, setFilterCategory] = useState<number | ''>('')

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api('/categories'),
  })

  const { data: notes } = useQuery<Note[]>({
    queryKey: ['notes', filterArchived, filterCategory],
    queryFn: () =>
      api(
        `/notes?archived=${filterArchived}&categoryId=${filterCategory || ''}`
      ),
  })

  const createNote = useMutation({
    mutationFn: (payload: Partial<Note> & { categoryIds?: number[] }) =>
      api<Note>('/notes', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })

  const updateNote = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<Note> & { categoryIds?: number[] }
    }) => api<Note>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })

  const archiveNote = useMutation({
    mutationFn: ({ id, archived }: { id: number; archived: boolean }) =>
      api<Note>(`/notes/${id}/archive`, { method: 'PATCH', body: JSON.stringify({ archived }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })

  const deleteNote = useMutation({
    mutationFn: async (note: Note) => {
      // Remove categories first
      await api(`/notes/${note.id}/categories`, {
        method: 'PATCH',
        body: JSON.stringify({ categoryIds: [] }),
      })
      // Then delete note
      return api(`/notes/${note.id}`, { method: 'DELETE' })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })

  const setNoteCategories = useMutation({
    mutationFn: ({ id, categoryIds }: { id: number; categoryIds: number[] }) =>
      api(`/notes/${id}/categories`, { method: 'PATCH', body: JSON.stringify({ categoryIds }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })

  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategories, setNewCategories] = useState<number[]>([])

  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const [editingCategories, setEditingCategories] = useState<number[]>([])

  const activeCount = useMemo(() => notes?.filter(n => !n.archived).length ?? 0, [notes])

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <h1>Ensolvers Notes</h1>

      {/* Filters */}
      <section style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <label><input type="checkbox" checked={filterArchived} onChange={e => setFilterArchived(e.target.checked)} /> Show archived</label>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value ? Number(e.target.value) : '')}>
          <option value="">All categories</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span style={{ marginLeft: 'auto' }}>Active notes: {activeCount}</span>
      </section>

      {/* Create Note */}
      <section style={{ padding: 12, border: '1px solid #ddd', borderRadius: 12, marginBottom: 24 }}>
        <h2>Create note</h2>
        <input
          placeholder="Title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />
        <textarea
          placeholder="Content"
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          style={{ width: '100%', padding: 8, minHeight: 80 }}
        />
        {categories && (
          <div style={{ marginBottom: 8 }}>
            <span>Categories:</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {categories.map(c => {
                const checked = newCategories.includes(c.id)
                return (
                  <label key={c.id} style={{ border: '1px solid #ddd', padding: '2px 6px', borderRadius: 8 }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => {
                        if (e.target.checked) setNewCategories([...newCategories, c.id])
                        else setNewCategories(newCategories.filter(id => id !== c.id))
                      }}
                    />
                    {' '}{c.name}
                  </label>
                )
              })}
            </div>
          </div>
        )}
        <button
          onClick={() => {
            createNote.mutate({ title: newTitle, content: newContent, categoryIds: newCategories })
            setNewTitle('')
            setNewContent('')
            setNewCategories([])
          }}
          disabled={!newTitle.trim()}
          style={{ marginTop: 8 }}
        >
          Add
        </button>
      </section>

      {/* Notes List */}
      <section>
        <h2>{filterArchived ? 'Archived notes' : 'Active notes'}</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {notes?.map(n => (
            <article key={n.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>
              <header style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {editingNoteId === n.id ? (
                  <>
                    <input value={editingTitle} onChange={e => setEditingTitle(e.target.value)} style={{ flex: 1, padding: 4 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => {
                        updateNote.mutate({ id: n.id, data: { title: editingTitle, content: editingContent, categoryIds: editingCategories } })
                        setEditingNoteId(null)
                      }}>Save</button>
                      <button onClick={() => setEditingNoteId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <strong>{n.title}</strong>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                      <button onClick={() => {
                        setEditingNoteId(n.id)
                        setEditingTitle(n.title)
                        setEditingContent(n.content || '')
                        setEditingCategories(n.categories.map(x => x.category.id))
                      }}>Edit</button>
                      <button onClick={() => archiveNote.mutate({ id: n.id, archived: !n.archived })}>
                        {n.archived ? 'Unarchive' : 'Archive'}
                      </button>
                      <button onClick={() => deleteNote.mutate(n)}>Delete</button>
                    </div>
                  </>
                )}
              </header>
              {editingNoteId === n.id ? (
                <>
                  <textarea value={editingContent} onChange={e => setEditingContent(e.target.value)} style={{ width: '100%', padding: 4, marginTop: 4 }} />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                    {categories?.map(c => {
                      const checked = editingCategories.includes(c.id)
                      return (
                        <label key={c.id} style={{ border: '1px solid #ddd', padding: '2px 6px', borderRadius: 8 }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              if (e.target.checked) setEditingCategories([...editingCategories, c.id])
                              else setEditingCategories(editingCategories.filter(id => id !== c.id))
                            }}
                          />
                          {' '}{c.name}
                        </label>
                      )
                    })}
                  </div>
                </>
              ) : (
                <>
                  <p>{n.content}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                    <span>Categories:</span>
                    {n.categories.map(c => (
                      <span key={c.category.id} style={{ border: '1px solid #ddd', padding: '2px 6px', borderRadius: 8 }}>
                        {c.category.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
        Phase 1: create/edit/delete/archive. Phase 2: categories & filtering.
      </footer>
    </div>
  )
}
