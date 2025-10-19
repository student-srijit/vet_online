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

    const { petInfo, recentActivities, currentTime } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `You are an expert pet care AI assistant. Based on the pet information and recent activities, provide 3-5 smart activity suggestions.

Pet Information: ${petInfo || "General pet"}

Recent Activities: ${JSON.stringify(recentActivities || [])}

Current Time: ${currentTime}

Please provide personalized activity suggestions that consider:
1. The pet's breed, age, and health status
2. Recent activity patterns and intensity
3. Time of day and optimal activity windows
4. Weather conditions (if applicable)
5. Health and wellness benefits

Format your response as a JSON array of suggestion strings. Each suggestion should be:
- Specific and actionable
- Tailored to the pet's needs
- Include timing recommendations
- Consider safety and health factors

Example format:
["Take a 20-minute morning walk for energy and mental stimulation", "Schedule a 15-minute training session to work on commands", "Plan a 30-minute play session with interactive toys"]

Provide 3-5 high-quality suggestions that will benefit the pet's physical and mental wellbeing.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const suggestionsText = response.text()

    // Parse the JSON response
    let suggestions: string[] = []
    try {
      // Clean up the response to extract JSON
      const jsonMatch = suggestionsText.match(/\[(.*?)\]/s)
      if (jsonMatch) {
        const jsonString = `[${jsonMatch[1]}]`
        suggestions = JSON.parse(jsonString)
      } else {
        // Fallback: split by lines and clean up
        suggestions = suggestionsText
          .split('\n')
          .filter(line => line.trim().startsWith('"'))
          .map(line => line.trim().replace(/^"|"$|,$/g, ''))
          .filter(suggestion => suggestion.length > 0)
      }
    } catch (parseError) {
      console.error("Error parsing AI suggestions:", parseError)
      // Fallback suggestions
      suggestions = [
        "Take a 20-minute walk for exercise and mental stimulation",
        "Schedule a 15-minute training session",
        "Plan some interactive playtime with toys",
        "Consider a grooming session for bonding",
        "Arrange socialization time with other pets"
      ]
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error("Activity suggestions error:", error)
    return NextResponse.json({
      success: false,
      error: `Failed to generate suggestions: ${error.message}`
    }, { status: 500 })
  }
}
