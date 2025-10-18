import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.HOST_EMAIL,
    pass: process.env.HOST_EMAIL_PASSWORD,
  },
})

export async function sendScheduleReminder(email: string, petName: string, scheduleType: string, time: string) {
  try {
    await transporter.sendMail({
      from: process.env.HOST_EMAIL,
      to: email,
      subject: `Time to ${scheduleType} ${petName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 25%, #06b6d4 75%, #14b8a6 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🐾 AutoPaws Reminder</h1>
          </div>
          <div style="padding: 30px; background: #f5e6f5;">
            <h2 style="color: #333;">Hi there!</h2>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">
              It's time to <strong>${scheduleType}</strong> your furry friend <strong>${petName}</strong> at <strong>${time}</strong>!
            </p>
            <p style="font-size: 14px; color: #999;">
              Keep your pet healthy and happy with regular feeding and activities.
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="background: linear-gradient(135deg, #ec4899 0%, #14b8a6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Open Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error("Email sending error:", error)
    return false
  }
}
