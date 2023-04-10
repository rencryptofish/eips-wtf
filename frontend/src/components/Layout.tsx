import Header from './Header'
import Footer from './Footer'
import { ReactNode } from 'react'

function Layout({ children }: { children: ReactNode }) {
    return (
      <div>
        <Header title="My Next.js App" />
        <main>{children}</main>
        <Footer />
      </div>
    )
  }
  
  export default Layout
