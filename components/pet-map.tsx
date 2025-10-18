"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

interface PetLocation {
  lat: number
  lng: number
  timestamp: string
  accuracy: number
}

interface PetMapProps {
  petLocation: PetLocation
  petName: string
}

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
  ),
})

export function PetMap({ petLocation, petName }: PetMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
  }

  return <LeafletMap petLocation={petLocation} petName={petName} />
}
