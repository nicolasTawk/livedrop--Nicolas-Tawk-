import catalog from '../../public/mock-catalog.json'

type Product = { id: string; title: string; price: number; image: string; tags: string[]; stockQty: number; description?: string }
type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Delivered'

const statusById: Record<string, {status: OrderStatus, carrier?: string, eta?: string}> = {}

export function listProducts(): Product[] {
  return (catalog as Product[])
}

export function getProduct(id: string): Product | undefined {
  return (catalog as Product[]).find(p=>p.id===id)
}

export function placeOrder(cart: {id:string; qty:number}[]) {
  const orderId = Math.random().toString(36).slice(2, 12).toUpperCase()
  // initialize status
  statusById[orderId] = { status: 'Placed' }
  return { orderId }
}

export function getOrderStatus(id: string) {
  // simple mock progression based on hash of id
  if (!statusById[id]) {
    const phases: OrderStatus[] = ['Placed','Packed','Shipped','Delivered']
    const idx = Math.abs([...id].reduce((a,c)=>a + c.charCodeAt(0), 0)) % phases.length
    const status = phases[idx]
    statusById[id] = { status }
  }
  const entry = statusById[id]
  if (entry.status === 'Shipped' || entry.status === 'Delivered') {
    entry.carrier = 'FastShip'
    if (!entry.eta) {
      const days = entry.status === 'Shipped' ? 3 : 0
      const eta = new Date(Date.now()+days*24*3600*1000).toISOString().slice(0,10)
      entry.eta = eta
    }
  }
  return { orderId: id, ...entry }
}
