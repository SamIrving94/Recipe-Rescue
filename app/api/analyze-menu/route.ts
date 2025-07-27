import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const dishSchema = z.object({
  name: z.string().describe("The name of the dish"),
  description: z.string().optional().describe("Brief description of the dish"),
  price: z.string().optional().describe("Price of the dish if visible"),
  category: z.string().optional().describe("Category like appetizer, main course, dessert, etc."),
})

const menuAnalysisSchema = z.object({
  dishes: z.array(dishSchema).describe("Array of dishes found in the menu"),
})

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const result = await generateObject({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this restaurant menu image and extract all the dishes with their details. Focus on identifying dish names, descriptions, prices, and categories. Be thorough and accurate. Group similar items and organize by typical menu sections.",
            },
            {
              type: "image",
              image: image,
            },
          ],
        },
      ],
      schema: menuAnalysisSchema,
      temperature: 0.1,
    })

    return NextResponse.json(result.object)
  } catch (error) {
    console.error("Error analyzing menu:", error)
    return NextResponse.json({ error: "Failed to analyze menu" }, { status: 500 })
  }
}
