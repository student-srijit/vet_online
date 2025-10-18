"use client"

import { useState, useEffect } from "react"

interface ClientTimestampProps {
  timestamp: Date
  className?: string
}

export function ClientTimestamp({ timestamp, className = "" }: ClientTimestampProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className={className}>--:--:--</span>
  }

  return (
    <span className={className}>
      {timestamp.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit' 
      })}
    </span>
  )
}
