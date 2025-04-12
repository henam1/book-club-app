"use client"

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system')

  useEffect(() => {
    // Check for saved preference or use system default
    const savedTheme = localStorage.getItem('theme') || 'system'
    setTheme(savedTheme)
    
    // Handle system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateTheme = () => {
      const resolvedTheme = 
        savedTheme === 'system' 
          ? (mediaQuery.matches ? 'dark' : 'light')
          : savedTheme
          
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    }
    
    updateTheme()
    mediaQuery.addEventListener('change', updateTheme)
    
    return () => mediaQuery.removeEventListener('change', updateTheme)
  }, [])

  const setThemePreference = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', systemTheme === 'dark')
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)