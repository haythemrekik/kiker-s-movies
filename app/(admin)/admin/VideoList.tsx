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

  const handleDelete = async (id: string, path: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      const res = await deleteVideo(id, path)
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
                <td className={styles.td}>
                  {editingId === video.id ? (
                    <Input 
                      value={editTitle} 
                      onChange={e => setEditTitle(e.target.value)} 
                      placeholder="Titre"
                    />
                  ) : (
                    video.title
                  )}
                </td>
                <td className={`${styles.td} ${styles.tdTruncate}`}>
                  {editingId === video.id ? (
                    <textarea 
                      className={styles.select} 
                      style={{ minHeight: '60px', padding: '0.5rem', resize: 'vertical' }}
                      value={editDesc} 
                      onChange={e => setEditDesc(e.target.value)} 
                      placeholder="Description"
                    />
                  ) : (
                    video.description || '-'
                  )}
                </td>
                <td className={styles.td}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                          Supprimer
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
