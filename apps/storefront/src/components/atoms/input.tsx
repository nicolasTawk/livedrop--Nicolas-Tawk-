import React from 'react'
type Props = React.InputHTMLAttributes<HTMLInputElement>
export default function Input(props: Props) {
  const { className='', ...rest } = props
  return <input {...rest} className={`border rounded-lg px-3 py-2 ${className}`.trim()} />
}
