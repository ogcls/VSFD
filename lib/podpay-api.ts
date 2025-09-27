interface PodPayTransactionData {
  amount: number
  currency?: string
  paymentMethod: string
  items: Array<{
    externalRef: string
    title: string
    unitPrice: number
    quantity: number
    tangible?: boolean
  }>
  customer: {
    name: string
    email: string
    document: {
      number: string
      type: string
    }
  }
  pix?: {
    expiresAt: string
  }
  postbackUrl?: string
}

interface PodPayResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export class PodPayAPI {
  private static readonly BASE_URL = "https://api.podpay.co/v1"
  private static readonly PUBLIC_KEY = process.env.PODPAY_PUBLIC_KEY || "pk_test_your_public_key_here"
  private static readonly SECRET_KEY = process.env.PODPAY_SECRET_KEY || "sk_test_your_secret_key_here"

  private static getAuthHeader(): string {
    const credentials = `${this.PUBLIC_KEY}:${this.SECRET_KEY}`
    return `Basic ${Buffer.from(credentials).toString("base64")}`
  }

  static async createTransaction(data: PodPayTransactionData): Promise<PodPayResponse> {
    try {
      console.log("[v0] PodPay API - Creating transaction:", data)

      if (
        !this.PUBLIC_KEY ||
        !this.SECRET_KEY ||
        this.PUBLIC_KEY.includes("your_") ||
        this.SECRET_KEY.includes("your_")
      ) {
        console.log("[v0] PodPay API keys not configured, using emergency fallback")
        return {
          success: false,
          error: "API keys not configured",
          message: "PodPay API keys missing - using emergency mode",
        }
      }

      const response = await fetch(`${this.BASE_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify({
          amount: Math.round(data.amount * 100), // Convert to centavos
          currency: data.currency || "BRL",
          paymentMethod: data.paymentMethod,
          items: data.items.map((item) => ({
            externalRef: item.externalRef,
            title: item.title,
            unitPrice: Math.round(item.unitPrice * 100), // Convert to centavos
            quantity: item.quantity,
            tangible: item.tangible || false,
          })),
          customer: data.customer,
          pix: data.pix,
          postbackUrl: data.postbackUrl,
        }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] PodPay API returned non-JSON response:", text.substring(0, 200))
        return {
          success: false,
          error: "Invalid API response format",
          message: "PodPay API returned HTML instead of JSON - check API endpoint and credentials",
        }
      }

      const result = await response.json()

      console.log("[v0] PodPay API Response:", {
        status: response.status,
        data: result,
      })

      if (!response.ok) {
        return {
          success: false,
          error: result.message || result.error || "Erro na API PodPay",
          message: result.message || "Falha ao criar transação",
        }
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("[v0] PodPay API Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        message: "Erro interno na comunicação com PodPay",
      }
    }
  }

  static async getTransaction(id: string): Promise<PodPayResponse> {
    try {
      console.log("[v0] PodPay API - Getting transaction:", id)

      if (id.startsWith("emergency-")) {
        console.log("[v0] Emergency transaction detected, returning mock data")
        return {
          success: true,
          data: {
            id: id,
            status: "pending",
            amount: 882, // R$ 8,82 in centavos
            currency: "BRL",
            paymentMethod: "pix",
            qrCode:
              "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540508.825802BR5913PODPAY DEMO6009SAO PAULO62070503***6304ABCD",
            pixCode:
              "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540508.825802BR5913PODPAY DEMO6009SAO PAULO62070503***6304ABCD",
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
          },
        }
      }

      if (
        !this.PUBLIC_KEY ||
        !this.SECRET_KEY ||
        this.PUBLIC_KEY.includes("your_") ||
        this.SECRET_KEY.includes("your_")
      ) {
        return {
          success: false,
          error: "API keys not configured",
        }
      }

      const response = await fetch(`${this.BASE_URL}/transactions/${id}`, {
        method: "GET",
        headers: {
          Authorization: this.getAuthHeader(),
        },
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] PodPay API returned non-JSON response:", text.substring(0, 200))
        return {
          success: false,
          error: "Invalid API response format",
        }
      }

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.message || result.error || "Erro na API PodPay",
        }
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("[v0] PodPay API Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }
    }
  }

  static async refundTransaction(id: string, amount?: number): Promise<PodPayResponse> {
    try {
      console.log("[v0] PodPay API - Refunding transaction:", { id, amount })

      if (
        !this.PUBLIC_KEY ||
        !this.SECRET_KEY ||
        this.PUBLIC_KEY.includes("your_") ||
        this.SECRET_KEY.includes("your_")
      ) {
        console.log("[v0] PodPay API keys not configured, using emergency fallback")
        return {
          success: false,
          error: "API keys not configured",
          message: "PodPay API keys missing - using emergency mode",
        }
      }

      const response = await fetch(`${this.BASE_URL}/transactions/${id}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify({
          amount: amount ? Math.round(amount * 100) : undefined,
        }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] PodPay API returned non-JSON response:", text.substring(0, 200))
        return {
          success: false,
          error: "Invalid API response format",
          message: "PodPay API returned HTML instead of JSON - check API endpoint and credentials",
        }
      }

      const result = await response.json()

      console.log("[v0] PodPay API Response:", {
        status: response.status,
        data: result,
      })

      if (!response.ok) {
        return {
          success: false,
          error: result.message || result.error || "Erro na API PodPay",
          message: result.message || "Falha ao criar transação",
        }
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("[v0] PodPay API Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        message: "Erro interno na comunicação com PodPay",
      }
    }
  }

  static async cancelTransfer(id: string): Promise<PodPayResponse> {
    try {
      console.log("[v0] PodPay API - Canceling transfer:", id)

      if (
        !this.PUBLIC_KEY ||
        !this.SECRET_KEY ||
        this.PUBLIC_KEY.includes("your_") ||
        this.SECRET_KEY.includes("your_")
      ) {
        console.log("[v0] PodPay API keys not configured, using emergency fallback")
        return {
          success: false,
          error: "API keys not configured",
          message: "PodPay API keys missing - using emergency mode",
        }
      }

      const response = await fetch(`${this.BASE_URL}/transfers/${id}/cancel`, {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
        },
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] PodPay API returned non-JSON response:", text.substring(0, 200))
        return {
          success: false,
          error: "Invalid API response format",
          message: "PodPay API returned HTML instead of JSON - check API endpoint and credentials",
        }
      }

      const result = await response.json()

      console.log("[v0] PodPay API Response:", {
        status: response.status,
        data: result,
      })

      if (!response.ok) {
        return {
          success: false,
          error: result.message || result.error || "Erro na API PodPay",
          message: result.message || "Falha ao cancelar transferência",
        }
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("[v0] PodPay API Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        message: "Erro interno na comunicação com PodPay",
      }
    }
  }
}
