'use client'
 
import { useState } from 'react'
import { deleteVideo, updateVideo } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './page.module.css'
import { Database } from '@/types/database.types'

type Video = Database['public']['Tables']['videos']['Row']

export function VideoList({ videos }: { videos: Video[] | null }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const startEdit = (video: Video) => {
    setEditingId(video.id)
    setEditTitle(video.title)
    setEditDesc(video.description || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleUpdate = async (id: string) => {
    setIsUpdating(true)
    try {
      const res = await updateVideo(id, editTitle, editDesc)
      if (res?.success) {
        setEditingId(null)
      } else if (res?.error) {
        alert(res.error)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string, path: string | null) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      const res = await deleteVideo(id, path || undefined)
      if (res?.error) {
        alert(res.error)
      }
    }
  }

  return (
    <div className={`glass-panel ${styles.card}`}>
      <h2 className={styles.cardTitle}>Gérer les Vidéos</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Titre</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos?.map(video => (
              <tr key={video.id}>
                <td className={styles.td} style={{ whiteSpace: 'nowrap', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {editingId === video.id ? (
                    <Input 
                      value={editTitle} 
                      onChange={e => setEditTitle(e.target.value)} 
                      placeholder="Titre"
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {video.youtube_video_id && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff4444">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                        </svg>
                      )}
                      {video.title}
                    </div>
                  )}
                </td>
                <td className={styles.td} style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {editingId === video.id ? (
                    <textarea 
                      className={styles.select} 
                      style={{ minHeight: '60px', padding: '0.4rem', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
                      value={editDesc} 
                      onChange={e => setEditDesc(e.target.value)} 
                      placeholder="Description"
                    />
                  ) : (
                    video.description || '-'
                  )}
                </td>
                <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {editingId === video.id ? (
                      <>
                        <Button size="sm" onClick={() => handleUpdate(video.id)} disabled={isUpdating}>
                          Sauvegarder
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isUpdating}>
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => startEdit(video)}>
                          Modifier
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(video.id, video.video_path)}>
                          Sup.
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(!videos || videos.length === 0) && (
              <tr>
                <td colSpan={3} className={styles.td} style={{ textAlign: 'center' }}>
                  Aucune vidéo trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
