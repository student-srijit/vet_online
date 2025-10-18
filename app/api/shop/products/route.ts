import { NextResponse } from "next/server"

const products = [
  {
    id: "1",
    name: "Premium Dog Food",
    category: "Food",
    price: 45.99,
    rating: 4.8,
    reviews: 127,
    image: "🍖",
    description: "High-quality nutrition for your dog",
  },
  {
    id: "2",
    name: "Interactive Toy",
    category: "Toys",
    price: 12.99,
    rating: 4.6,
    reviews: 89,
    image: "🧸",
    description: "Keep your pet entertained",
  },
  {
    id: "3",
    name: "Comfort Bed",
    category: "Accessories",
    price: 89.99,
    rating: 4.9,
    reviews: 156,
    image: "🛏️",
    description: "Cozy sleeping space for your pet",
  },
  {
    id: "4",
    name: "Health Treats",
    category: "Food",
    price: 19.99,
    rating: 4.7,
    reviews: 92,
    image: "🍪",
    description: "Nutritious and delicious treats",
  },
  {
    id: "5",
    name: "Grooming Kit",
    category: "Care",
    price: 34.99,
    rating: 4.5,
    reviews: 67,
    image: "✂️",
    description: "Professional grooming tools",
  },
  {
    id: "6",
    name: "Travel Carrier",
    category: "Travel",
    price: 67.99,
    rating: 4.8,
    reviews: 134,
    image: "🧳",
    description: "Safe and comfortable travel",
  },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    products,
  })
}
