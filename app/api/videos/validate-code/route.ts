import { NextRequest, NextResponse } from 'next/server'
import { validateCode } from '@/app/(dashboard)/video/[id]/actions'

export async function POST(req: NextRequest) {
  try {
    const { videoId, code } = await req.json()
    if (!videoId || !code) {
      return NextResponse.json({ error: 'Missing videoId or code' }, { status: 400 })
    }

    const res = await validateCode(videoId, code)
    
    if (res.success) {
      return NextResponse.json({ status: 'ALLOWED' })
    } else {
      return NextResponse.json({ status: 'INVALID_CODE', error: res.error })
    }
  } catch (error) {
    console.error('API Validate Code Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
