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

    const { recordId, prescriptionData } = await req.json()

    if (!recordId || !prescriptionData) {
      return NextResponse.json({ error: "Record ID and prescription data are required" }, { status: 400 })
    }

    const db = await getDB()
    const recordsCollection = db.collection("health_records")
    const usersCollection = db.collection("users")
    
    // Get the health record
    const record = await recordsCollection.findOne({
      _id: new (await import("mongodb")).ObjectId(recordId),
      userId: new (await import("mongodb")).ObjectId(userId)
    })

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    // Get user and pet data
    const user = await usersCollection.findOne(
      { _id: new (await import("mongodb")).ObjectId(userId) },
      { projection: { fullName: 1, email: 1, pets: 1 } }
    )

    if (!user || !user.pets || user.pets.length === 0) {
      return NextResponse.json({ error: "User or pet not found" }, { status: 404 })
    }

    const pet = user.pets[0]

    // Generate prescription
    const prescription = generatePrescription(record, pet, user, prescriptionData)

    return NextResponse.json({ prescription }, { status: 200 })
  } catch (error) {
    console.error("Prescription generation error:", error)
    return NextResponse.json({ error: "Failed to generate prescription" }, { status: 500 })
  }
}

function generatePrescription(record: any, pet: any, user: any, prescriptionData: any) {
  const now = new Date()
  const prescriptionId = `RX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  
  const prescription = {
    id: prescriptionId,
    date: now.toISOString(),
    petOwner: {
      name: user.fullName,
      email: user.email
    },
    pet: {
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      color: pet.color
    },
    veterinarian: {
      name: prescriptionData.vetName || "Dr. Smith",
      license: prescriptionData.vetLicense || "DVM-12345",
      clinic: prescriptionData.clinicName || "AutoPaws Veterinary Clinic",
      phone: prescriptionData.clinicPhone || "(555) 123-4567",
      address: prescriptionData.clinicAddress || "123 Pet Care Ave, City, State 12345"
    },
    diagnosis: {
      primary: prescriptionData.diagnosis || record.description,
      secondary: prescriptionData.secondaryDiagnosis || "",
      notes: prescriptionData.diagnosisNotes || record.notes || ""
    },
    medications: prescriptionData.medications || [],
    instructions: prescriptionData.instructions || [],
    followUp: {
      required: prescriptionData.followUpRequired || false,
      date: prescriptionData.followUpDate || "",
      notes: prescriptionData.followUpNotes || ""
    },
    restrictions: prescriptionData.restrictions || [],
    emergencyContact: prescriptionData.emergencyContact || "Emergency Vet: (555) 911-PETS",
    prescriptionNotes: prescriptionData.prescriptionNotes || "Please follow all instructions carefully. Contact us if you have any questions.",
    recordReference: {
      recordId: record._id,
      recordType: record.type,
      recordDate: record.date
    }
  }

  return prescription
}
