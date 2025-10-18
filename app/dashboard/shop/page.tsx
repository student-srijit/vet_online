"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ShoppingCart, Star, Plus, Minus } from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  price: number
  rating: number
  reviews: number
  image: string
  description: string
}

interface CartItem {
  productId: string
  quantity: number
  product?: Product
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/shop/products")
      const data = await response.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { productId: product.id, quantity: 1, product }]
    })
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId)
    } else {
      setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
    }
  }

  const cartTotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)
    return sum + (product?.price || 0) * item.quantity
  }, 0)

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          totalAmount: cartTotal,
          paymentMethod: "paypal",
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert("Order placed successfully! Order ID: " + data.orderId)
        setCart([])
        setShowCart(false)
      }
    } catch (error) {
      console.error("Checkout error:", error)
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="gradient-pink-teal rounded-2xl p-8 text-white mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Pet Shop</h2>
          <p className="text-white/90">Everything your pet needs, delivered to your door</p>
        </div>
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative bg-white/20 hover:bg-white/30 p-4 rounded-lg transition-all"
        >
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Products Grid */}
        <div className={`${showCart ? "lg:col-span-2" : "lg:col-span-4"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
                <div className="text-5xl mb-4 text-center">{product.image}</div>
                <h3 className="font-bold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>

                <div className="flex items-center gap-1 mb-3">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-gray-800">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-purple-600">${product.price}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{product.category}</span>
                </div>

                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping Cart Sidebar */}
        {showCart && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h3>

              {cart.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => {
                      const product = products.find((p) => p.id === item.productId)
                      if (!product) return null

                      return (
                        <div key={item.productId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-gray-800">{product.name}</p>
                              <p className="text-sm text-gray-600">${product.price}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(item.productId)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="flex-1 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-bold text-gray-800">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-bold text-gray-800">Free</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="text-2xl font-bold text-purple-600">${cartTotal.toFixed(2)}</span>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3"
                    >
                      Proceed to Checkout
                    </Button>

                    <Button onClick={() => setShowCart(false)} variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
