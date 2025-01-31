import Main from '@/components/main'
import React from 'react'

export default function HomePage() {
  const header = <div>Header</div>
  const footer = <div>Footer</div>
  return (
    <Main>
      {header}
      <div>HomePage</div>
      {footer}
    </Main>
  )
}
