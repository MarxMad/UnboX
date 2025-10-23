'use client';

import { useRouter } from 'next/navigation';

export default function TestPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p className="text-xl mb-8">Esta es una página de prueba</p>
        <button 
          onClick={() => router.back()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
