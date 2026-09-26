export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💰</div>
          <h1 className="text-2xl font-bold text-gray-900">MyLife Money</h1>
          <p className="text-sm text-gray-500 mt-1">Your personal finance assistant</p>
        </div>
        {children}
      </div>
    </div>
  )
}
