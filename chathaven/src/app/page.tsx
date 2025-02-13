'use client'

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Panton' }}>
        ChatHaven
      </h1>
      <div className="space-x-4">
        <button 
          onClick={() => router.push('/login')} 
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          style={{ fontFamily: 'Comfortaa' }}
        >
          Login
        </button>
        <button 
          onClick={() => router.push('/register')} 
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          style={{ fontFamily: 'Comfortaa' }}
        >
          Register
        </button>
      </div>
    </div>
  );
}
