"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface PetLocation {
  lat: number
  lng: number
  timestamp: string
  accuracy: number
}

interface LeafletMapProps {
  petLocation: PetLocation
  petName: string
}

export default function LeafletMap({ petLocation, petName }: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([petLocation.lat, petLocation.lng], 15)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current)
    }

    // Add pet marker
    const petIcon = L.divIcon({
      html: `<div style="font-size: 32px; text-align: center;">🐕</div>`,
      iconSize: [40, 40],
      className: "pet-marker",
    })

    L.marker([petLocation.lat, petLocation.lng], { icon: petIcon })
      .addTo(map.current)
      .bindPopup(`<strong>${petName}</strong><br/>Last seen: ${petLocation.timestamp}`)

    // Add accuracy circle
    L.circle([petLocation.lat, petLocation.lng], {
      color: "#a855f7",
      fillColor: "#a855f7",
      fillOpacity: 0.1,
      radius: petLocation.accuracy,
    }).addTo(map.current)

    // Center map on pet
    map.current.setView([petLocation.lat, petLocation.lng], 15)
  }, [petLocation, petName])

  return <div ref={mapContainer} style={{ width: "100%", height: "400px", borderRadius: "12px" }} />
}
