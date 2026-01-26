import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll window to top
    window.scrollTo(0, 0)
    
    // Also scroll the main content area if it exists (for dashboard layout)
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}

export default ScrollToTop
