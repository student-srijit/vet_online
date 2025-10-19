import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = verifyToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return NextResponse.json({ 
        error: "Gemini API key not configured. Please set up your GEMINI_API_KEY environment variable." 
      }, { status: 500 })
    }

    const formData = await req.formData()
    const imageFile = formData.get("image") as File
    const petInfo = formData.get("petInfo") as string

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer()
    const imageBase64 = Buffer.from(bytes).toString('base64')
    const mimeType = imageFile.type

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `You are an expert veterinary AI assistant. Analyze this pet photo and provide comprehensive insights.

Pet Information: ${petInfo || "General pet analysis"}

Please provide a detailed analysis covering:

1. **Health Assessment**: Look for any visible signs of health issues, skin conditions, eye problems, or other concerns
2. **Behavioral Indicators**: Analyze posture, expression, and body language for behavioral insights
3. **Physical Condition**: Assess body condition, coat health, and overall physical appearance
4. **Breed Identification**: If possible, identify the breed or breed mix
5. **Age Estimation**: Provide an estimated age range based on physical characteristics
6. **Care Recommendations**: Suggest specific care tips based on your analysis
7. **Nutritional Insights**: Any dietary recommendations based on visible condition
8. **Activity Level**: Assess energy level and activity needs

Format your response in a clear, professional manner that pet owners can easily understand. If you notice any concerning signs, recommend consulting a veterinarian.

IMPORTANT: This is for informational purposes only and should not replace professional veterinary care.`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      }
    ])

    const response = result.response
    const analysis = response.text()

    // Store analysis in database for future reference
    const db = await getDB()
    const analysesCollection = db.collection("photo_analyses")
    
    await analysesCollection.insertOne({
      userId: userId,
      petInfo: petInfo,
      analysis: analysis,
      imageType: mimeType,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error("Photo analysis error:", error)
    return NextResponse.json({
      success: false,
      error: `AI analysis failed: ${error.message}`
    }, { status: 500 })
  }
}
