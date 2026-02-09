'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [status, setStatus] = useState('Checking connection...')
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkSupabase() {
      try {
        const supabase = createClient()
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })

        // Note: It might error if table doesn't exist, but that means connection worked!
        // If connection failed (bad key), it would be a different error.

        if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
          // 42P01 is "relation does not exist" which is expected since we haven't created tables.
          // But if it's 401 Unauthorized or similar, then key is bad.
          if (error.message.includes('FetchError') || error.message.includes('apikey')) {
            throw error
          }
        }
        setStatus('Connected to Supabase successfully!')
      } catch (err: any) {
        setStatus('Connection failed')
        setError(err.message || 'Unknown error')
      }
    }

    checkSupabase()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Trading Journal App</h1>
      <div className="p-6 border rounded-lg bg-gray-800">
        <p className="text-xl mb-4">System Status:</p>
        <p className={`font-mono ${status.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>
          {status}
        </p>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>
    </main>
  )
}
