'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() =&gt; {
    setMounted(true)
  }, [])

  if (!mounted) {
    return &lt;div className="w-10 h-10" /&gt;
  }

  return (
    &lt;Button
      variant="ghost"
      size="icon"
      onClick={() =&gt; setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
    &gt;
      &lt;Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" /&gt;
      &lt;Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" /&gt;
      &lt;span className="sr-only"&gt;Toggle theme&lt;/span&gt;
    &lt;/Button&gt;
  )
}