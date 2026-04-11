import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const products = await db.product.findMany()

  return Response.json(products)
}