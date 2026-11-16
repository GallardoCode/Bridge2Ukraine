import type { ReactNode } from 'react'
import './site.css'
import './page-sections.css'

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  )
}
