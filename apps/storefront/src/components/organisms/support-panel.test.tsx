import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import SupportPanel from './support-panel'

describe('SupportPanel', () => {
  test('known policy question returns answer with citation', async () => {
    render(<SupportPanel open={true} onClose={()=>{}} />)
    const input = screen.getByLabelText(/Ask a question/i)
    fireEvent.change(input, { target: { value: 'What is your return window?' } })
    fireEvent.click(screen.getByText(/Submit/))
    await waitFor(()=> {
      expect(screen.getByText(/30 days/)).toBeInTheDocument()
      expect(screen.getByText(/\[Q01\]/)).toBeInTheDocument()
    })
  })

  test('out of scope refuses', async () => {
    render(<SupportPanel open={true} onClose={()=>{}} />)
    const input = screen.getByLabelText(/Ask a question/i)
    fireEvent.change(input, { target: { value: 'Tell me the weather' } })
    fireEvent.click(screen.getByText(/Submit/))
    await waitFor(()=> {
      expect(screen.getByText(/can’t answer/i)).toBeInTheDocument()
    })
  })

  test('question with valid order id includes status and citation (if matched)', async () => {
    render(<SupportPanel open={true} onClose={()=>{}} />)
    const input = screen.getByLabelText(/Ask a question/i)
    fireEvent.change(input, { target: { value: 'Where is my order ABCDEFGHIJ?' } })
    fireEvent.click(screen.getByText(/Submit/))
    await waitFor(()=> {
      expect(screen.getByText(/Order •••/)).toBeInTheDocument()
    })
  })
})
