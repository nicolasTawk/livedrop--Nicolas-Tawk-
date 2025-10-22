import GT from './ground-truth.json'
import { getOrderStatus } from '../lib/api'

type QA = { qid: string; category: string; question: string; answer: string }

const ORDER_RE = /[A-Z0-9]{10,}/g

function maskId(id: string) {
  if (id.length <= 4) return id
  return '•••' + id.slice(-4)
}

function score(q: string, qa: QA) {
  const tokens = new Set(q.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean))
  const cand = new Set(qa.question.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean))
  let overlap = 0
  tokens.forEach(t => { if (cand.has(t)) overlap++ })
  return overlap
}

export async function askSupport(input: string) {
  const normalizedInput = input.toLowerCase().trim()

  // Handle greetings and polite responses
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
  const farewells = ['goodbye', 'bye', 'see you', 'farewell', 'have a good day', 'take care']
  const thanks = ['thank you', 'thanks', 'appreciate it', 'much appreciated']

  if (greetings.some(greeting => normalizedInput.includes(greeting))) {
    return { reply: "Hello! How can I help you today? I can assist with shipping, returns, warranty, payments, or check your order status if you provide an order ID.", citation: null }
  }

  if (farewells.some(farewell => normalizedInput.includes(farewell))) {
    return { reply: "Goodbye! Have a great day and feel free to reach out if you need any help.", citation: null }
  }

  if (thanks.some(thank => normalizedInput.includes(thank))) {
    return { reply: "You're welcome! I'm happy to help. Is there anything else I can assist you with?", citation: null }
  }

  const ids = input.match(ORDER_RE) || []
  let status: any = null
  if (ids.length) {
    // only show last 4 chars for display
    status = await getOrderStatus(ids[0])
  }
  const ranked = (GT as QA[]).map(qa => ({ qa, s: score(input, qa) })).sort((a, b) => b.s - a.s)
  const top = ranked[0]
  const lowConfidence = !top || top.s === 0
  if (lowConfidence && !status) {
    return { reply: "Sorry—I can't answer that. Please ask about shipping, returns, warranty, payments, or share an order ID.", citation: null }
  }
  let answer = top && top.s > 0 ? `${top.qa.answer} [${top.qa.qid}]` : ""
  if (status) {
    const masked = maskId(status.orderId)
    const carrier = status.carrier ? ` via ${status.carrier}` : ''
    const eta = status.eta ? `; ETA ${status.eta}` : ''
    const line = `Order ${masked}: ${status.status}${carrier}${eta}.`
    answer = answer ? `${line}

${answer}` : line
    const cite = top && top.s > 0 ? `[${top.qa.qid}]` : null
    return { reply: answer, citation: cite }
  }
  return { reply: answer, citation: `[${top.qa.qid}]` }
}
