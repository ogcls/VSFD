interface PodPayTransactionRequest {
  amount: number
  currency: string
  paymentMethod: string
  items: Array<{
    externalRef: string
    title: string
    unitPrice: number
    quantity: number
    tangible: boolean
  }>
  customer: {
    name: string
    email: string
    document: {
      number: string
      type: string
    }
  }
  pix: {
    expiresAt: string
  }
}

interface PodPayTransactionResponse {
  id: string
  amount: number
  currency: string
  status: string
  pixPayload?: string
  pix?: {
    qrcode?: string
  }
  [key: string]: any
}

interface PodPayAPIResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export class PodPayAPI {
  private static readonly BASE_URL = 'https://api.podpay.co/v1'
  
  private static getAuthHeader(): string {
    const publicKey = process.env.PODPAY_PUBLIC_KEY
    const secretKey = process.env.PODPAY_SECRET_KEY
    
    if (!publicKey || !secretKey) {
      throw new Error('PodPay API keys not configured')
    }
    
    const credentials = `${publicKey}:${secretKey}`
    return `Basic ${Buffer.from(credentials).toString('base64')}`
  }

  static async createTransaction(data: PodPayTransactionRequest): Promise<PodPayAPIResponse<PodPayTransactionResponse>> {
    try {
      console.log("[v0] Creating PIX transaction with data:", data)
      
      const response = await fetch(`${this.BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      console.log("[v0] PodPay createTransaction raw response:", result)

      if (response.ok && result.data) {
        // Extrair pixPayload do campo pix.qrcode se disponível
        if (result.data.pix?.qrcode && !result.data.pixPayload) {
          result.data.pixPayload = result.data.pix.qrcode
        }
        
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Erro ao criar transação',
          details: result
        }
      }
    } catch (error) {
      console.error("[v0] Error creating transaction:", error)
      return {
        success: false,
        error: 'Erro de conexão com a API PodPay',
        details: error
      }
    }
  }

  static async getTransaction(id: string): Promise<PodPayAPIResponse<PodPayTransactionResponse>> {
    try {
      console.log("[v0] Getting transaction:", id)
      
      const response = await fetch(`${this.BASE_URL}/transactions/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      })

      const result = await response.json()
      console.log("[v0] PodPay getTransaction raw response:", result)

      if (response.ok && result.data) {
        // Extrair pixPayload do campo pix.qrcode se disponível
        if (result.data.pix?.qrcode && !result.data.pixPayload) {
          result.data.pixPayload = result.data.pix.qrcode
        }
        
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Transação não encontrada',
          details: result
        }
      }
    } catch (error) {
      console.error("[v0] Error getting transaction:", error)
      return {
        success: false,
        error: 'Erro de conexão com a API PodPay',
        details: error
      }
    }
  }
}
