import { generateDiseaseInfo } from "@/lib/gemini"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { disease, petType } = await req.json()

    if (!disease) {
      return NextResponse.json({ error: "Disease name is required" }, { status: 400 })
    }

    const response = await generateDiseaseInfo(disease, petType || "dog")

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error) {
    console.error("Disease info error:", error)
    return NextResponse.json({ error: "Failed to generate information" }, { status: 500 })
  }
}
