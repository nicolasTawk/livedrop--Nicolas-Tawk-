import { create } from 'zustand'

export type CartItem = { id: string; title: string; price: number; image: string; qty: number }
type State = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'qty'>, qty?: number)=>void
  remove: (id: string)=>void
  setQty: (id: string, qty: number)=>void
  clear: ()=>void
}

const LS_KEY = 'sf-cart-v1'

function load(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function save(items: CartItem[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)) } catch {}
}

export const useCart = create<State>((set, get)=>({
  items: load(),
  add: (item, qty=1)=> set(s=>{
    const existing = s.items.find(i=>i.id===item.id)
    let next = s.items
    if (existing) {
      next = s.items.map(i=> i.id===item.id ? {...i, qty: i.qty + qty} : i)
    } else {
      next = [...s.items, {...item, qty}]
    }
    save(next); return { items: next }
  }),
  remove: (id)=> set(s=>{ const next = s.items.filter(i=>i.id!==id); save(next); return {items: next} }),
  setQty: (id, qty)=> set(s=>{ const next = s.items.map(i=> i.id===id? {...i, qty: Math.max(1, qty)} : i); save(next); return {items: next} }),
  clear: ()=> set(()=>{ save([]); return {items: []} })
}))

export const cartTotal = (items: CartItem[])=> items.reduce((sum, i)=> sum + i.price*i.qty, 0)
