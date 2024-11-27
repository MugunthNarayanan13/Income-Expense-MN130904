import { Metadata } from "next"
import './globals.css'
import Sidebar from "@/components/Sidebar"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: 'Income Expense Tracker',
  description: 'Tracking my personal Income and Expenses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const footer = (
    <footer>
      <p>Made by <span className=" cursor-pointer ">Mugunth Narayanan</span></p>
    </footer>
  )

  return (
    <html lang="en">
      <body className=" w-[90vw] mx-auto text-sm sm:text-base md:text-lg flex flex-col min-h-screen">
        <Navbar />
        <div className=" flex flex-row flex-1 ">
          <Sidebar />
          {children}
        </div>
        {footer}
      </body>
    </html>
  )
}
