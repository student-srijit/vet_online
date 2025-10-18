"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText, Plus, X } from "lucide-react"

interface PrescriptionDownloadProps {
  recordId: string
  recordType: string
  recordDescription: string
}

export function PrescriptionDownload({ recordId, recordType, recordDescription }: PrescriptionDownloadProps) {
  const [showForm, setShowForm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [prescriptionData, setPrescriptionData] = useState({
    vetName: "",
    vetLicense: "",
    clinicName: "",
    clinicPhone: "",
    clinicAddress: "",
    diagnosis: recordDescription,
    secondaryDiagnosis: "",
    diagnosisNotes: "",
    medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
    instructions: [""],
    followUpRequired: false,
    followUpDate: "",
    followUpNotes: "",
    restrictions: [""],
    emergencyContact: "",
    prescriptionNotes: ""
  })

  const handleInputChange = (field: string, value: any) => {
    setPrescriptionData(prev => ({ ...prev, [field]: value }))
  }

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const newMedications = [...prescriptionData.medications]
    newMedications[index] = { ...newMedications[index], [field]: value }
    setPrescriptionData(prev => ({ ...prev, medications: newMedications }))
  }

  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: "", dosage: "", frequency: "", duration: "" }]
    }))
  }

  const removeMedication = (index: number) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...prescriptionData.instructions]
    newInstructions[index] = value
    setPrescriptionData(prev => ({ ...prev, instructions: newInstructions }))
  }

  const addInstruction = () => {
    setPrescriptionData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }))
  }

  const removeInstruction = (index: number) => {
    setPrescriptionData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }))
  }

  const handleRestrictionChange = (index: number, value: string) => {
    const newRestrictions = [...prescriptionData.restrictions]
    newRestrictions[index] = value
    setPrescriptionData(prev => ({ ...prev, restrictions: newRestrictions }))
  }

  const addRestriction = () => {
    setPrescriptionData(prev => ({
      ...prev,
      restrictions: [...prev.restrictions, ""]
    }))
  }

  const removeRestriction = (index: number) => {
    setPrescriptionData(prev => ({
      ...prev,
      restrictions: prev.restrictions.filter((_, i) => i !== index)
    }))
  }

  const generatePrescription = async () => {
    setGenerating(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/prescriptions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recordId,
          prescriptionData
        }),
      })

      if (response.ok) {
        const data = await response.json()
        downloadPrescription(data.prescription)
        setShowForm(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to generate prescription: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error generating prescription:", error)
      alert("An error occurred while generating the prescription")
    } finally {
      setGenerating(false)
    }
  }

  const downloadPrescription = (prescription: any) => {
    const prescriptionHTML = generatePrescriptionHTML(prescription)
    const blob = new Blob([prescriptionHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prescription-${prescription.id}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generatePrescriptionHTML = (prescription: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Veterinary Prescription - ${prescription.id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .clinic-info { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .medication { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        .signature { margin-top: 30px; }
        .prescription-id { font-weight: bold; color: #007bff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>VETERINARY PRESCRIPTION</h1>
        <p class="prescription-id">Prescription ID: ${prescription.id}</p>
        <p>Date: ${new Date(prescription.date).toLocaleDateString()}</p>
    </div>

    <div class="clinic-info">
        <h2>${prescription.veterinarian.clinic}</h2>
        <p>${prescription.veterinarian.address}</p>
        <p>Phone: ${prescription.veterinarian.phone}</p>
    </div>

    <div class="section">
        <h3>VETERINARIAN INFORMATION</h3>
        <p><strong>Name:</strong> ${prescription.veterinarian.name}</p>
        <p><strong>License:</strong> ${prescription.veterinarian.license}</p>
    </div>

    <div class="section">
        <h3>PET INFORMATION</h3>
        <p><strong>Name:</strong> ${prescription.pet.name}</p>
        <p><strong>Breed:</strong> ${prescription.pet.breed}</p>
        <p><strong>Age:</strong> ${prescription.pet.age}</p>
        <p><strong>Weight:</strong> ${prescription.pet.weight}</p>
        <p><strong>Color:</strong> ${prescription.pet.color}</p>
    </div>

    <div class="section">
        <h3>OWNER INFORMATION</h3>
        <p><strong>Name:</strong> ${prescription.petOwner.name}</p>
        <p><strong>Email:</strong> ${prescription.petOwner.email}</p>
    </div>

    <div class="section">
        <h3>DIAGNOSIS</h3>
        <p><strong>Primary:</strong> ${prescription.diagnosis.primary}</p>
        ${prescription.diagnosis.secondary ? `<p><strong>Secondary:</strong> ${prescription.diagnosis.secondary}</p>` : ''}
        ${prescription.diagnosis.notes ? `<p><strong>Notes:</strong> ${prescription.diagnosis.notes}</p>` : ''}
    </div>

    <div class="section">
        <h3>MEDICATIONS</h3>
        ${prescription.medications.map((med: any) => `
            <div class="medication">
                <p><strong>Medication:</strong> ${med.name}</p>
                <p><strong>Dosage:</strong> ${med.dosage}</p>
                <p><strong>Frequency:</strong> ${med.frequency}</p>
                <p><strong>Duration:</strong> ${med.duration}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h3>INSTRUCTIONS</h3>
        <ul>
            ${prescription.instructions.map((instruction: string) => `<li>${instruction}</li>`).join('')}
        </ul>
    </div>

    ${prescription.restrictions.length > 0 ? `
    <div class="section">
        <h3>RESTRICTIONS</h3>
        <ul>
            ${prescription.restrictions.map((restriction: string) => `<li>${restriction}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    ${prescription.followUp.required ? `
    <div class="section">
        <h3>FOLLOW-UP</h3>
        <p><strong>Required:</strong> Yes</p>
        <p><strong>Date:</strong> ${prescription.followUp.date}</p>
        <p><strong>Notes:</strong> ${prescription.followUp.notes}</p>
    </div>
    ` : ''}

    <div class="section">
        <h3>EMERGENCY CONTACT</h3>
        <p>${prescription.emergencyContact}</p>
    </div>

    <div class="section">
        <h3>PRESCRIPTION NOTES</h3>
        <p>${prescription.prescriptionNotes}</p>
    </div>

    <div class="signature">
        <p><strong>Veterinarian Signature:</strong> _________________________</p>
        <p><strong>Date:</strong> _________________________</p>
    </div>

    <div class="footer">
        <p>This prescription was generated by AutoPaws Pet Health Management System</p>
        <p>Record Reference: ${prescription.recordReference.recordType} - ${new Date(prescription.recordReference.recordDate).toLocaleDateString()}</p>
    </div>
</body>
</html>
    `
  }

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        variant="outline"
        size="sm"
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <FileText size={16} className="mr-2" />
        Download Prescription
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Generate Prescription</h2>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              size="sm"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Veterinarian Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Veterinarian Name</label>
                <input
                  type="text"
                  value={prescriptionData.vetName}
                  onChange={(e) => handleInputChange('vetName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                <input
                  type="text"
                  value={prescriptionData.vetLicense}
                  onChange={(e) => handleInputChange('vetLicense', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DVM-12345"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
                <input
                  type="text"
                  value={prescriptionData.clinicName}
                  onChange={(e) => handleInputChange('clinicName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AutoPaws Veterinary Clinic"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Phone</label>
                <input
                  type="text"
                  value={prescriptionData.clinicPhone}
                  onChange={(e) => handleInputChange('clinicPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Address</label>
              <input
                type="text"
                value={prescriptionData.clinicAddress}
                onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Pet Care Ave, City, State 12345"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Diagnosis</label>
              <input
                type="text"
                value={prescriptionData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Diagnosis (Optional)</label>
              <input
                type="text"
                value={prescriptionData.secondaryDiagnosis}
                onChange={(e) => handleInputChange('secondaryDiagnosis', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-800">Medications</h3>
                <Button onClick={addMedication} size="sm" variant="outline">
                  <Plus size={16} className="mr-2" />
                  Add Medication
                </Button>
              </div>
              {prescriptionData.medications.map((med, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Medication {index + 1}</h4>
                    <Button onClick={() => removeMedication(index)} size="sm" variant="outline" className="text-red-600">
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Medication name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 10mg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Twice daily"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Duration</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-800">Instructions</h3>
                <Button onClick={addInstruction} size="sm" variant="outline">
                  <Plus size={16} className="mr-2" />
                  Add Instruction
                </Button>
              </div>
              {prescriptionData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter instruction"
                  />
                  <Button onClick={() => removeInstruction(index)} size="sm" variant="outline" className="text-red-600">
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>

            {/* Follow-up */}
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={prescriptionData.followUpRequired}
                  onChange={(e) => handleInputChange('followUpRequired', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Follow-up Required</span>
              </label>
            </div>

            {prescriptionData.followUpRequired && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                  <input
                    type="date"
                    value={prescriptionData.followUpDate}
                    onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Notes</label>
                  <input
                    type="text"
                    value={prescriptionData.followUpNotes}
                    onChange={(e) => handleInputChange('followUpNotes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Follow-up instructions"
                  />
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
              <input
                type="text"
                value={prescriptionData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Emergency Vet: (555) 911-PETS"
              />
            </div>

            {/* Prescription Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Notes</label>
              <textarea
                value={prescriptionData.prescriptionNotes}
                onChange={(e) => handleInputChange('prescriptionNotes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Additional notes for the prescription"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              onClick={generatePrescription}
              disabled={generating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {generating ? (
                <>
                  <Download className="animate-spin mr-2" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2" size={16} />
                  Generate & Download Prescription
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
