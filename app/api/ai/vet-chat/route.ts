import { generateVetResponse } from "@/lib/gemini"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { petInfo, message, isEmergency } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Enhanced emergency detection
    const emergencyKeywords = [
      'emergency', 'urgent', 'critical', 'dying', 'unconscious', 'bleeding', 
      'seizure', 'not breathing', 'choking', 'poisoned', 'injury', 'accident',
      'severe pain', 'can\'t walk', 'vomiting blood', 'difficulty breathing'
    ]
    
    const detectedEmergency = emergencyKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    ) || isEmergency

    let response: string

    if (detectedEmergency) {
      response = `🚨 EMERGENCY DETECTED! 

Based on your description, this appears to be a medical emergency. Please take the following immediate actions:

1. **Stay calm** and keep your pet as comfortable as possible
2. **Contact your nearest emergency veterinary clinic immediately**
3. **Do not attempt to treat serious conditions at home**
4. **If your pet is unconscious or not breathing, begin CPR if trained**

Emergency symptoms that require immediate veterinary attention:
- Difficulty breathing or choking
- Unconsciousness or severe lethargy
- Severe bleeding or trauma
- Seizures or neurological symptoms
- Signs of poisoning
- Severe vomiting or diarrhea with blood

I'm flagging this as an emergency and recommend you contact emergency veterinary services right away. Your pet's health and safety are the top priority.

Would you like me to help you locate the nearest emergency veterinary clinic?`
    } else {
      // Generate normal AI response
      response = await generateVetResponse(petInfo, message)
      
      // Clean up any markdown formatting that might slip through
      response = response
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/#{1,6}\s/g, '') // Remove header markdown
        .replace(/`(.*?)`/g, '$1') // Remove code markdown
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove link markdown
    }

    return NextResponse.json({
      success: true,
      response,
      isEmergency: detectedEmergency,
      emergencyLevel: detectedEmergency ? 'high' : 'low'
    })
  } catch (error) {
    console.error("Vet chat error:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message || "AI service is currently unavailable. Please try again later or contact your veterinarian directly.",
      isEmergency: false,
      emergencyLevel: 'low'
    }, { status: 500 })
  }
}
