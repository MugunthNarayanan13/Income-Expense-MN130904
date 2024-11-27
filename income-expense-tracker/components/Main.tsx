import React from 'react'

export default function Main(props: { children: React.ReactNode }) {
    const { children } = props
    return (
        <main className=' flex flex-1 flex-col p-4 sm:p-8 '>
            {children}
        </main>
    )
}
