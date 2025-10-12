import React from 'react'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement>
export default function Button(props: Props) {
  const { className='', ...rest } = props
  return <button {...rest} className={`px-3 py-1.5 rounded-lg border ${className}`.trim()} />
}
