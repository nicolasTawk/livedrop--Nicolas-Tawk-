import React, { useEffect, useRef, useState } from 'react'
import { askSupport } from '../../assistant/engine'

export default function SupportPanel({open,onClose}:{open:boolean; onClose:()=>void}){
  const [q, setQ] = useState('')
  const [a, setA] = useState<string>('')
  const [c, setC] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    if (!open) return
    const trap = (e: KeyboardEvent)=> { if (e.key==='Escape') onClose() }
    document.addEventListener('keydown', trap)
    ref.current?.focus()
    return ()=> document.removeEventListener('keydown', trap)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { reply, citation } = await askSupport(q)
    setA(reply)
    setC(citation)
  }

  if (!open) return null
  return (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div ref={ref} className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl p-4 outline-none" tabIndex={0}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Ask Support</h3>
          <button onClick={onClose} aria-label="Close support" className="px-2 py-1 border rounded">Close</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <label className="text-sm">Your question
            <input aria-label="Ask a question" className="mt-1 w-full border rounded-lg px-3 py-2" value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g., What is your return window? or ORDER ABCDE12345" />
          </label>
          <button className="px-3 py-1.5 rounded-lg bg-gray-900 text-white">Submit</button>
        </form>
        <div className="mt-4 whitespace-pre-wrap text-sm">
          {a && <div>{a} {c? c: null}</div>}
        </div>
        <p className="mt-4 text-xs text-gray-500">Answers are restricted to known policy and order status only.</p>
      </div>
    </div>
  )
}
