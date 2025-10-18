import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

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

    const { breed, age, weight, healthRecords } = await req.json()

    if (!breed) {
      return NextResponse.json({ error: "Breed is required" }, { status: 400 })
    }

    // Get Gemini API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey || geminiApiKey === "your-gemini-api-key-here") {
      // Return fallback analysis if API key is not configured
      const fallbackAnalysis = {
        breedInfo: {
          commonHealthIssues: ["Regular health monitoring recommended", "Annual checkups important"],
          lifespan: "Varies by breed",
          size: "Varies by breed", 
          energyLevel: "Varies by breed"
        },
        recommendations: {
          vaccinations: ["Annual vaccinations recommended", "Core vaccines essential"],
          preventiveCare: ["Regular vet checkups", "Dental care", "Weight monitoring"],
          monitoring: ["Monitor weight and activity", "Watch for behavioral changes"]
        },
        healthInsights: {
          currentStatus: "Based on available records",
          risks: ["Regular monitoring recommended"],
          suggestions: ["Maintain regular vet visits", "Keep vaccination records updated"]
        }
      }
      
      return NextResponse.json({ analysis: fallbackAnalysis }, { status: 200 })
    }

    // Prepare health records summary for AI analysis
    const recordsSummary = healthRecords?.map((record: any) => 
      `${record.type}: ${record.description} on ${new Date(record.date).toLocaleDateString()}`
    ).join(", ") || "No health records available"

    const prompt = `
    Analyze this ${breed} dog's health profile and provide comprehensive insights:
    
    Pet Details:
    - Breed: ${breed}
    - Age: ${age || "Not specified"}
    - Weight: ${weight || "Not specified"}
    
    Health Records: ${recordsSummary}
    
    Please provide:
    1. Breed-specific health considerations and common issues
    2. Recommended vaccination schedule based on breed and age
    3. Weight and activity recommendations
    4. Preventive care suggestions
    5. Health monitoring tips specific to this breed
    6. Any potential health risks to watch for
    
    Format the response as a JSON object with the following structure:
    {
      "breedInfo": {
        "commonHealthIssues": ["issue1", "issue2"],
        "lifespan": "X-Y years",
        "size": "small/medium/large",
        "energyLevel": "low/medium/high"
      },
      "recommendations": {
        "vaccinations": ["vaccine1", "vaccine2"],
        "preventiveCare": ["care1", "care2"],
        "monitoring": ["monitor1", "monitor2"]
      },
      "healthInsights": {
        "currentStatus": "assessment",
        "risks": ["risk1", "risk2"],
        "suggestions": ["suggestion1", "suggestion2"]
      }
    }
    `

    let response
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      })
    } catch (fetchError) {
      console.log("Gemini API fetch failed, using fallback")
      const fallbackAnalysis = {
        breedInfo: {
          commonHealthIssues: ["Regular health monitoring recommended", "Annual checkups important"],
          lifespan: "Varies by breed",
          size: "Varies by breed", 
          energyLevel: "Varies by breed"
        },
        recommendations: {
          vaccinations: ["Annual vaccinations recommended", "Core vaccines essential"],
          preventiveCare: ["Regular vet checkups", "Dental care", "Weight monitoring"],
          monitoring: ["Monitor weight and activity", "Watch for behavioral changes"]
        },
        healthInsights: {
          currentStatus: "Based on available records",
          risks: ["Regular monitoring recommended"],
          suggestions: ["Maintain regular vet visits", "Keep vaccination records updated"]
        }
      }
      
      return NextResponse.json({ analysis: fallbackAnalysis }, { status: 200 })
    }

    if (!response.ok) {
      console.log(`Gemini API not available: ${response.statusText}`)
      // Return fallback analysis instead of throwing error
      const fallbackAnalysis = {
        breedInfo: {
          commonHealthIssues: ["Regular health monitoring recommended", "Annual checkups important"],
          lifespan: "Varies by breed",
          size: "Varies by breed", 
          energyLevel: "Varies by breed"
        },
        recommendations: {
          vaccinations: ["Annual vaccinations recommended", "Core vaccines essential"],
          preventiveCare: ["Regular vet checkups", "Dental care", "Weight monitoring"],
          monitoring: ["Monitor weight and activity", "Watch for behavioral changes"]
        },
        healthInsights: {
          currentStatus: "Based on available records",
          risks: ["Regular monitoring recommended"],
          suggestions: ["Maintain regular vet visits", "Keep vaccination records updated"]
        }
      }
      
      return NextResponse.json({ analysis: fallbackAnalysis }, { status: 200 })
    }

    const data = await response.json()
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!analysisText) {
      throw new Error("No analysis received from AI")
    }

    // Try to parse JSON response, fallback to text if parsing fails
    let analysis
    try {
      analysis = JSON.parse(analysisText)
    } catch {
      // If JSON parsing fails, create a structured response from text
      analysis = {
        breedInfo: {
          commonHealthIssues: ["General health monitoring recommended"],
          lifespan: "Varies by breed",
          size: "Varies by breed",
          energyLevel: "Varies by breed"
        },
        recommendations: {
          vaccinations: ["Annual vaccinations recommended"],
          preventiveCare: ["Regular vet checkups"],
          monitoring: ["Monitor weight and activity"]
        },
        healthInsights: {
          currentStatus: "Based on available records",
          risks: ["Regular monitoring recommended"],
          suggestions: ["Maintain regular vet visits"]
        },
        rawAnalysis: analysisText
      }
    }

    // Store analysis in database
    const db = await getDB()
    const analysisCollection = db.collection("breed_analysis")
    
    await analysisCollection.insertOne({
      userId: new (await import("mongodb")).ObjectId(userId),
      breed,
      age,
      weight,
      analysis,
      createdAt: new Date()
    })

    return NextResponse.json({ analysis }, { status: 200 })
  } catch (error) {
    console.error("Breed analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze breed" }, { status: 500 })
  }
}
