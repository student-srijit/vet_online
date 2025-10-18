import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateVetResponse(petInfo: string, userMessage: string) {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return generateFallbackVetResponse(petInfo, userMessage)
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

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
    return generateFallbackVetResponse(petInfo, userMessage)
  }
}

function generateFallbackVetResponse(petInfo: string, userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  // Vaccination-related responses
  if (lowerMessage.includes('vaccination') || lowerMessage.includes('vaccine') || lowerMessage.includes('shot')) {
    return `Thank you for asking about vaccinations for your pet! Vaccinations are crucial for keeping your pet healthy and protected from serious diseases.

For your pet's vaccination schedule, I recommend:

CORE VACCINES (Essential for all pets):
- Rabies: Required by law, typically every 1-3 years
- DHPP: Protects against Distemper, Hepatitis, Parvovirus, and Parainfluenza, usually every 1-3 years

NON-CORE VACCINES (Based on lifestyle):
- Bordetella: If your pet goes to boarding, dog parks, or daycare
- Leptospirosis: If your pet spends time outdoors near water
- Lyme Disease: If you live in tick-prone areas
- Canine Influenza: If your pet is frequently around other dogs

RECOMMENDATIONS:
1. Check your pet's current vaccination records
2. Schedule a checkup with your veterinarian
3. Discuss your pet's lifestyle and risk factors
4. Follow your vet's recommended schedule

IMPORTANT: Always consult with your veterinarian for a personalized vaccination plan. They can assess your pet's individual needs and local requirements.

Is there anything specific about vaccinations you'd like to know more about?`
  }
  
  // Diet-related responses
  if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eating')) {
    return `Great question about your pet's diet! Proper nutrition is essential for your pet's health and wellbeing.

GENERAL DIETARY GUIDELINES:
- High-quality commercial pet food appropriate for your pet's age and size
- Consistent feeding schedule (usually 2-3 meals per day for adults)
- Fresh water available at all times
- Avoid human foods that can be toxic to pets

SIGNS OF GOOD NUTRITION:
- Healthy weight and body condition
- Shiny coat and healthy skin
- Good energy levels
- Regular, well-formed stools

WHEN TO CONSULT YOUR VET:
- Sudden changes in appetite
- Weight loss or gain
- Digestive issues
- Food allergies or sensitivities

RECOMMENDATIONS:
1. Choose age-appropriate food (puppy, adult, senior)
2. Follow feeding guidelines on the food package
3. Monitor your pet's weight and body condition
4. Discuss any dietary concerns with your veterinarian

Your veterinarian can provide specific dietary recommendations based on your pet's individual needs, health status, and any medical conditions.

Would you like advice on any specific aspect of your pet's diet?`
  }
  
  // General health responses
  if (lowerMessage.includes('sick') || lowerMessage.includes('ill') || lowerMessage.includes('not feeling')) {
    return `I understand you're concerned about your pet's health. It's always better to be cautious when it comes to your pet's wellbeing.

SIGNS THAT REQUIRE IMMEDIATE VETERINARY ATTENTION:
- Difficulty breathing or choking
- Unconsciousness or severe lethargy
- Severe bleeding or trauma
- Seizures or neurological symptoms
- Signs of poisoning
- Severe vomiting or diarrhea with blood
- Inability to urinate or defecate

GENERAL SIGNS OF ILLNESS TO MONITOR:
- Changes in appetite or water consumption
- Lethargy or decreased activity
- Vomiting or diarrhea
- Changes in behavior or personality
- Coughing, sneezing, or breathing difficulties
- Changes in urination or defecation

WHAT TO DO:
1. Monitor your pet closely for any concerning symptoms
2. Keep your pet comfortable and quiet
3. Contact your veterinarian if symptoms persist or worsen
4. In case of emergency, contact an emergency veterinary clinic immediately

RECOMMENDATIONS:
- Schedule a checkup with your veterinarian
- Keep a record of symptoms and when they started
- Follow your vet's treatment recommendations
- Don't give any medications without veterinary approval

Your veterinarian is the best resource for diagnosing and treating your pet's health concerns. When in doubt, it's always better to consult with a professional.

Is there anything specific about your pet's symptoms you'd like to discuss?`
  }
  
  // Default response
  return `Thank you for reaching out about your pet's health! I'm here to help with any questions or concerns you may have.

GENERAL PET HEALTH TIPS:
- Regular veterinary checkups are essential
- Keep vaccinations up to date
- Provide a balanced diet and fresh water
- Ensure regular exercise and mental stimulation
- Monitor for any changes in behavior or health

COMMON CONCERNS I CAN HELP WITH:
- Vaccination schedules and requirements
- Diet and nutrition advice
- Exercise and activity recommendations
- Behavioral questions
- Preventive care guidelines
- When to seek veterinary attention

IMPORTANT REMINDER:
While I can provide general guidance, always consult with your veterinarian for:
- Specific medical diagnoses
- Treatment plans
- Emergency situations
- Medication recommendations

Your pet's health and safety are the top priority. If you have any urgent concerns or if your pet is showing signs of illness, please contact your veterinarian or an emergency veterinary clinic immediately.

What specific aspect of your pet's health would you like to discuss?`
}

export async function generateDiseaseInfo(disease: string, petType: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

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
}
