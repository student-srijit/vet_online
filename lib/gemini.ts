import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateVetResponse(petInfo: string, userMessage: string) {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      throw new Error("Gemini API key not configured")
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `You are an experienced veterinarian AI assistant helping pet owners. 
    
Pet Information: ${petInfo}

User Question: ${userMessage}

Provide professional veterinary advice in a friendly, conversational manner. Be empathetic and helpful. If the issue seems serious, recommend consulting a real veterinarian.

IMPORTANT: Format your response as plain text without any markdown formatting. Do not use ** for bold, * for italics, or any other markdown syntax. Use simple text formatting only.`

    const result = await model.generateContent(prompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error("Gemini API error:", error)
    throw new Error(`AI service unavailable: ${error.message}`)
  }
}

export async function generateDiseaseInfo(disease: string, petType: string) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      throw new Error("Gemini API key not configured")
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `You are a knowledgeable pet health expert. A pet owner is asking about ${disease} in their ${petType}.

Provide:
1. What is ${disease}?
2. Symptoms to watch for
3. Prevention tips
4. When to see a vet
5. Treatment options

Keep the response informative but easy to understand for pet owners.`

    const result = await model.generateContent(prompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error("Gemini API error:", error)
    throw new Error(`AI service unavailable: ${error.message}`)
  }
}
