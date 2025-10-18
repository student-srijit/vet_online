import { MongoClient } from "mongodb"

let cachedClient: MongoClient | null = null

export async function connectDB() {
  if (cachedClient) {
    return cachedClient
  }

  const client = new MongoClient(process.env.MONGODB_URI!)
  await client.connect()
  cachedClient = client
  return client
}

export async function getDB() {
  const client = await connectDB()
  return client.db("autopaws")
}
