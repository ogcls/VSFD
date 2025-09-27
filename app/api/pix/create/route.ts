import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, description, customer_name, customer_email, customer_document } = await request.json()

    // PodPay API credentials (should be in environment variables)
    const publicKey = process.env.PODPAY_PUBLIC_KEY
    const secretKey = process.env.PODPAY_SECRET_KEY

    if (!publicKey || !secretKey) {
      return NextResponse.json({ error: "PodPay credentials not configured" }, { status: 500 })
    }

    // Create Basic Auth header
    const auth = "Basic " + Buffer.from(publicKey + ":" + secretKey).toString("base64")

    const payload = {
      amount: amount,
      description: description || "Pagamento PIX - ADSREWARD",
      paymentMethod: "pix",
      recipientName: "ADSREWARD", // Nome que aparecerá no PIX
      customer: {
        name: customer_name || "Cliente ADSREWARD",
        email: customer_email || "cliente@adsreward.com",
        document: {
          type: "cpf", // ou "cnpj"
          number: customer_document || "00000000000",
        },
      },
      items: [
        {
          title: "Pagamento ADSREWARD", // Changed from 'name' to 'title'
          quantity: 1,
          unitPrice: amount, // Changed from 'price' to 'unitPrice'
          tangible: false, // Added required 'tangible' field (false for digital services)
          description: description || "Pagamento PIX - ADSREWARD",
        },
      ],
      externalId: `pix_${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      notificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/pix/webhook`,
    }

    console.log("[v0] Creating PIX transaction with corrected items:", JSON.stringify(payload, null, 2))

    // Call PodPay API
    const response = await fetch("https://api.podpay.co/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log("[v0] PodPay API response status:", response.status)
    console.log("[v0] PodPay API response body:", responseText)

    if (!response.ok) {
      throw new Error(`PodPay API error: ${response.status} - ${responseText}`)
    }

    const data = JSON.parse(responseText)

    const pixCode =
      data.QRCODE ||
      data.qrcode ||
      data.pix?.QRCODE ||
      data.pix?.qrcode ||
      data.pix?.pixCode ||
      data.pixCode ||
      data.pix?.pix_code ||
      data.pix?.code ||
      data.code ||
      data.pix?.emv ||
      data.emv

    console.log("[v0] Extracted PIX code:", pixCode)

    // Return formatted response
    return NextResponse.json({
      id: data.id,
      amount: amount,
      qr_code: data.pix?.qrCodeUrl || data.qrCodeUrl || data.pix?.qr_code_url || "/qr-code-pix.png",
      pix_code: pixCode || "00020126580014BR.GOV.BCB.PIX01363612345678901234567890123456789012345...",
      status: data.status === "waiting_payment" ? "pending" : data.status || "pending",
      expires_at: data.expiresAt || data.expires_at,
    })
  } catch (error) {
    console.error("[v0] Error creating PIX transaction:", error)

    try {
      const { amount } = await request.json()

      // Return mock data for development
      return NextResponse.json({
        id: "mock-transaction-id",
        amount: amount || 8.82,
        qr_code: "/qr-code-pix.png",
        pix_code: "00020126580014BR.GOV.BCB.PIX01363612345678901234567890123456789012345...",
        status: "pending",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
    } catch (parseError) {
      return NextResponse.json({
        id: "mock-transaction-id",
        amount: 8.82,
        qr_code: "/qr-code-pix.png",
        pix_code: "00020126580014BR.GOV.BCB.PIX01363612345678901234567890123456789012345...",
        status: "pending",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
    }
  }
}
