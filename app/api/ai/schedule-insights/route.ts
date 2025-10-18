import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

interface BreedSchedule {
  type: string
  time: string
  description: string
  priority: 'low' | 'medium' | 'high'
  healthBenefit: string
  breedSpecific: boolean
  weatherDependent: boolean
  healthBased: boolean
}

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

    const db = await getDB()
    const usersCollection = db.collection("users")
    
    // Get user and pet data
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { pets: 1 } }
    )

    if (!user || !user.pets || user.pets.length === 0) {
      return NextResponse.json({ error: "No pet found" }, { status: 404 })
    }

    const pet = user.pets[0]
    const breed = pet.breed?.toLowerCase() || ""
    const age = pet.age || 0
    const weight = pet.weight || 0

    // Generate breed-specific AI insights and schedules
    const breedAnalysis = analyzeBreed(breed, age, weight)
    const aiSchedules = generateBreedSchedules(breed, age, weight)

    return NextResponse.json({
      success: true,
      analysis: breedAnalysis,
      schedules: aiSchedules,
      petInfo: {
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error("AI schedule insights error:", error)
    return NextResponse.json({ error: `Failed to generate AI insights: ${error.message}` }, { status: 500 })
  }
}

function analyzeBreed(breed: string, age: number, weight: number) {
  const analysis = {
    breedCharacteristics: "",
    healthConsiderations: [] as string[],
    activityNeeds: "",
    feedingRecommendations: [] as string[],
    groomingNeeds: [] as string[],
    behavioralInsights: [] as string[],
    ageSpecificNeeds: [] as string[]
  }

  // Breed-specific analysis
  if (breed.includes('labrador') || breed.includes('retriever')) {
    analysis.breedCharacteristics = "Labradors are energetic, friendly, and highly trainable dogs known for their love of water and retrieving."
    analysis.healthConsiderations = [
      "Hip and elbow dysplasia risk",
      "Obesity tendency - monitor weight closely",
      "Joint health important due to active nature",
      "Ear infections due to floppy ears"
    ]
    analysis.activityNeeds = "High - requires 60-90 minutes of exercise daily"
    analysis.feedingRecommendations = [
      "2-3 meals per day to prevent bloat",
      "High-quality protein for muscle maintenance",
      "Monitor portion sizes to prevent obesity"
    ]
    analysis.groomingNeeds = [
      "Weekly brushing to manage shedding",
      "Regular ear cleaning",
      "Nail trimming every 2-3 weeks"
    ]
    analysis.behavioralInsights = [
      "Highly social - needs interaction",
      "Prone to separation anxiety",
      "Excellent with children and other pets"
    ]
  } else if (breed.includes('german shepherd')) {
    analysis.breedCharacteristics = "German Shepherds are intelligent, loyal, and protective working dogs with high energy and strong work drive."
    analysis.healthConsiderations = [
      "Hip dysplasia common",
      "Bloat risk - feed smaller meals",
      "Degenerative myelopathy risk",
      "Pancreatic insufficiency possible"
    ]
    analysis.activityNeeds = "Very High - requires 90+ minutes of exercise and mental stimulation"
    analysis.feedingRecommendations = [
      "3-4 smaller meals to prevent bloat",
      "High-quality protein for working dog needs",
      "Consider joint supplements"
    ]
    analysis.groomingNeeds = [
      "Daily brushing during shedding seasons",
      "Regular dental care",
      "Nail maintenance important"
    ]
    analysis.behavioralInsights = [
      "Needs mental stimulation and training",
      "Protective instincts require socialization",
      "Can be aloof with strangers"
    ]
  } else if (breed.includes('bulldog') || breed.includes('pug')) {
    analysis.breedCharacteristics = "Brachycephalic breeds with flat faces, known for their calm demeanor but requiring special health considerations."
    analysis.healthConsiderations = [
      "Breathing difficulties in hot weather",
      "Heat sensitivity - avoid overexertion",
      "Skin fold infections",
      "Eye problems common"
    ]
    analysis.activityNeeds = "Low to Moderate - short walks and gentle play"
    analysis.feedingRecommendations = [
      "Smaller, more frequent meals",
      "Avoid overfeeding due to low activity",
      "Special bowls to prevent gulping air"
    ]
    analysis.groomingNeeds = [
      "Daily face and skin fold cleaning",
      "Regular eye cleaning",
      "Nail trimming every 2-3 weeks"
    ]
    analysis.behavioralInsights = [
      "Generally calm and good-natured",
      "Can be stubborn but eager to please",
      "Good apartment dogs"
    ]
  } else {
    analysis.breedCharacteristics = "Your pet is a wonderful companion with unique characteristics."
    analysis.healthConsiderations = [
      "Regular veterinary checkups important",
      "Monitor weight and activity levels",
      "Dental care essential"
    ]
    analysis.activityNeeds = "Moderate - regular exercise and play"
    analysis.feedingRecommendations = [
      "High-quality commercial pet food",
      "Consistent feeding schedule",
      "Monitor portion sizes"
    ]
    analysis.groomingNeeds = [
      "Regular brushing",
      "Nail trimming",
      "Dental hygiene"
    ]
    analysis.behavioralInsights = [
      "Each pet has unique personality",
      "Consistent training and socialization",
      "Regular interaction and play"
    ]
  }

  // Age-specific considerations
  if (age < 1) {
    analysis.ageSpecificNeeds.push("Puppy stage - high energy, frequent meals, socialization critical")
  } else if (age >= 1 && age < 7) {
    analysis.ageSpecificNeeds.push("Adult stage - establish routine, maintain health, regular exercise")
  } else if (age >= 7) {
    analysis.ageSpecificNeeds.push("Senior stage - monitor health closely, adjust activity, joint care important")
  }

  return analysis
}

function generateBreedSchedules(breed: string, age: number, weight: number): BreedSchedule[] {
  const schedules: BreedSchedule[] = []

  // Base feeding schedule
  if (age < 1) {
    schedules.push({
      type: "Puppy Feeding",
      time: "07:00",
      description: "Morning puppy meal - high protein for growth",
      priority: "high",
      healthBenefit: "Supports healthy growth and development",
      breedSpecific: true,
      weatherDependent: false,
      healthBased: true
    })
    schedules.push({
      type: "Puppy Feeding",
      time: "12:00",
      description: "Midday puppy meal - smaller portion",
      priority: "high",
      healthBenefit: "Maintains steady energy and growth",
      breedSpecific: true,
      weatherDependent: false,
      healthBased: true
    })
    schedules.push({
      type: "Puppy Feeding",
      time: "17:00",
      description: "Evening puppy meal - main meal",
      priority: "high",
      healthBenefit: "Supports overnight growth and recovery",
      breedSpecific: true,
      weatherDependent: false,
      healthBased: true
    })
  } else {
    schedules.push({
      type: "Morning Feeding",
      time: "07:00",
      description: "Adult morning meal - balanced nutrition",
      priority: "high",
      healthBenefit: "Provides energy for the day",
      breedSpecific: true,
      weatherDependent: false,
      healthBased: true
    })
    schedules.push({
      type: "Evening Feeding",
      time: "18:00",
      description: "Adult evening meal - complete nutrition",
      priority: "high",
      healthBenefit: "Supports overnight recovery and health",
      breedSpecific: true,
      weatherDependent: false,
      healthBased: true
    })
  }

  // Breed-specific exercise schedules
  if (breed.includes('labrador') || breed.includes('retriever')) {
    schedules.push({
      type: "High-Intensity Exercise",
      time: "08:00",
      description: "Morning run or fetch session - Labradors need vigorous exercise",
      priority: "high",
      healthBenefit: "Prevents obesity and maintains joint health",
      breedSpecific: true,
      weatherDependent: true,
      healthBased: true
    })
    schedules.push({
      type: "Swimming Session",
      time: "15:00",
      description: "Water activity - perfect for Labradors",
      priority: "medium",
      healthBenefit: "Low-impact exercise, great for joints",
      breedSpecific: true,
      weatherDependent: true,
      healthBased: true
    })
  } else if (breed.includes('german shepherd')) {
    schedules.push({
      type: "Intensive Training",
      time: "08:00",
      description: "Mental stimulation and obedience training",
      priority: "high",
      healthBenefit: "Prevents behavioral issues, satisfies work drive",
      breedSpecific: true,
      weatherDependent: false,
      healthBased: true
    })
    schedules.push({
      type: "Long Walk/Run",
      time: "16:00",
      description: "Extended exercise session for high-energy breed",
      priority: "high",
      healthBenefit: "Burns energy, maintains physical health",
      breedSpecific: true,
      weatherDependent: true,
      healthBased: true
    })
  } else if (breed.includes('bulldog') || breed.includes('pug')) {
    schedules.push({
      type: "Gentle Walk",
      time: "09:00",
      description: "Short, gentle walk - avoid overexertion",
      priority: "medium",
      healthBenefit: "Maintains mobility without stressing breathing",
      breedSpecific: true,
      weatherDependent: true,
      healthBased: true
    })
    schedules.push({
      type: "Indoor Play",
      time: "14:00",
      description: "Cool indoor activity during hot weather",
      priority: "medium",
      healthBenefit: "Mental stimulation without heat stress",
      breedSpecific: true,
      weatherDependent: true,
      healthBased: true
    })
  } else {
    schedules.push({
      type: "Daily Exercise",
      time: "16:00",
      description: "Regular exercise session tailored to your pet",
      priority: "medium",
      healthBenefit: "Maintains physical and mental health",
      breedSpecific: true,
      weatherDependent: true,
      healthBased: true
    })
  }

  // Health monitoring schedules
  if (age >= 7) {
    schedules.push({
      type: "Joint Care Exercise",
      time: "19:00",
      description: "Gentle stretching and joint-friendly activities",
      priority: "high",
      healthBenefit: "Maintains mobility and reduces arthritis pain",
      breedSpecific: false,
      weatherDependent: false,
      healthBased: true
    })
  }

  // Grooming schedules
  if (breed.includes('labrador') || breed.includes('retriever')) {
    schedules.push({
      type: "Ear Cleaning",
      time: "20:00",
      description: "Weekly ear cleaning to prevent infections",
      priority: "medium",
      healthBenefit: "Prevents ear infections common in floppy-eared breeds",
      breedSpecific: true,
      weatherDependent: false,
      healthBased: true
    })
  }

  if (breed.includes('bulldog') || breed.includes('pug')) {
    schedules.push({
      type: "Face Cleaning",
      time: "21:00",
      description: "Daily face and skin fold cleaning",
      priority: "high",
      healthBenefit: "Prevents skin infections in facial folds",
      breedSpecific: true,
      weatherDependent: false,
      healthBased: true
    })
  }

  // Mental stimulation
  schedules.push({
    type: "Mental Stimulation",
    time: "10:00",
    description: "Puzzle toys, training, or interactive games",
    priority: "medium",
    healthBenefit: "Prevents boredom and behavioral issues",
    breedSpecific: false,
    weatherDependent: false,
    healthBased: true
  })

  // Hydration check (especially important for active breeds)
  if (breed.includes('labrador') || breed.includes('german shepherd')) {
    schedules.push({
      type: "Hydration Check",
      time: "14:00",
      description: "Ensure adequate water intake after exercise",
      priority: "high",
      healthBenefit: "Prevents dehydration and heat stress",
      breedSpecific: true,
      weatherDependent: true,
      healthBased: true
    })
  }

  return schedules
}
