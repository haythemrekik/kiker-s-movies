import { NextRequest, NextResponse } from 'next/server'
import { checkAccess } from '@/app/(dashboard)/video/[id]/actions'

export async function POST(req: NextRequest) {
  try {
    const { videoId } = await req.json()
    if (!videoId) {
      return NextResponse.json({ error: 'Missing videoId' }, { status: 400 })
    }

    const status = await checkAccess(videoId)
    
    return NextResponse.json({ 
      status: status === 'allowed' ? 'ALLOWED' : 'CODE_REQUIRED' 
    })
  } catch (error) {
    console.error('API Check Access Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
