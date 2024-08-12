import './globals.css'
import './bootstrap.scss'
import NavBar from './components/NavBar'
import type { ReactNode } from 'react'
// import 'bootstrap/dist/css/bootstrap.min.css'

export default function RootLayout ({
  children
}: {
    children: ReactNode;
}) {
  return (
    <html lang='en'>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <NavBar />
        <div style={{ marginTop: '100px' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
