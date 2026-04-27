'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { updateVideoDescription, deleteVideo } from './actions'
import Link from 'next/link'
import { Database } from '@/types/database.types'

type Video = Database['public']['Tables']['videos']['Row']

interface VideoListItemProps {
  video: Video
}

export function VideoListItem({ video }: VideoListItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(video.description || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    const result = await updateVideoDescription(video.id, description)
    if (result && result.error) {
      setError(result.error)
    } else {
      setIsEditing(false)
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setIsDeleting(true)
    setError(null)
    const result = await deleteVideo(video.id)
    if (result && result.error) {
      setError(result.error)
      setIsDeleting(false)
      setConfirmDelete(false)
    }
    // If successful, the server action revalidates the path and this component will unmount
  }

  return (
    <li style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <strong style={{ fontSize: '1.1rem' }}>{video.title}</strong>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isEditing && (
            <>
              <Link href={`/video/${video.id}`}>
                <Button variant="outline" size="sm">Visionner</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Modifier</Button>
            </>
          )}
          <Button 
            variant={confirmDelete ? "default" : "ghost"} 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ backgroundColor: confirmDelete ? '#ef4444' : undefined, color: confirmDelete ? 'white' : '#ef4444' }}
          >
            {isDeleting ? 'Suppression...' : confirmDelete ? 'Confirmer ?' : 'Supprimer'}
          </Button>
        </div>
      </div>

      {error && <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ 
              width: '100%', 
              minHeight: '80px', 
              padding: '0.5rem', 
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: 'white',
              resize: 'vertical'
            }}
            placeholder="Description de la vidéo..."
            disabled={isSaving}
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', margin: 0 }}>
          {video.description || <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Aucune description</span>}
        </p>
      )}
    </li>
  )
}
