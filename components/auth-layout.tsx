import type React from "react"
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gradient-purple-teal min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-pink-300 rounded-full opacity-30 blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-300 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-purple-300 rounded-full opacity-25 blur-2xl"></div>

      {/* Main content */}
      <div className="flex w-full max-w-6xl gap-8 items-center justify-between">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center flex-1 text-white">
          <div className="relative w-80 h-80 mb-8">
            <div className="absolute inset-0 bg-white/10 rounded-full backdrop-blur-md border border-white/20"></div>
            <div className="absolute inset-8 flex items-center justify-center">
              <div className="text-6xl">🐕</div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-16 h-16 bg-pink-300 rounded-full opacity-40"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-cyan-300 rounded-full opacity-40"></div>
          </div>
          <h1 className="text-5xl font-bold mb-2">AutoPaws</h1>
          <p className="text-xl opacity-90">One Stop Pet Feeding Solution</p>
          <div className="mt-6 flex items-center gap-2 text-lg">
            <span className="text-2xl">⭐</span>
            <span>10k+ Happy Pets</span>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex justify-center">{children}</div>
      </div>
    </div>
  )
}
