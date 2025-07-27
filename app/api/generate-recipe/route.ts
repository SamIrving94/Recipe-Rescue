import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"

const recipeSchema = z.object({
  title: z.string().describe("Recipe title"),
  ingredients: z.array(z.string()).describe("List of ingredients with quantities"),
  instructions: z.array(z.string()).describe("Step-by-step cooking instructions"),
  cook_time: z.string().describe("Total cooking time"),
  servings: z.string().describe("Number of servings"),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level"),
  cuisine_type: z.string().describe("Type of cuisine"),
})

export async function POST(request: NextRequest) {
  try {
    const { dishName, dishDescription, restaurantName } = await request.json()
    const supabase = createServerClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await generateObject({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: `Create a detailed home recipe to recreate "${dishName}" ${dishDescription ? `(${dishDescription})` : ""} ${restaurantName ? `from ${restaurantName}` : ""}. 
          
          Provide a complete recipe that a home cook can follow, including:
          - Accurate ingredient list with measurements
          - Clear step-by-step instructions
          - Cooking time and difficulty level
          - Number of servings
          - Cuisine type
          
          Make it authentic and achievable for home cooking while capturing the essence of the restaurant dish.`,
        },
      ],
      schema: recipeSchema,
      temperature: 0.3,
    })

    // Save the generated recipe to the database
    const { data: recipe, error } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        title: result.object.title,
        source_type: "ai",
        ingredients: result.object.ingredients,
        instructions: result.object.instructions,
        cook_time: result.object.cook_time,
        servings: result.object.servings,
        difficulty: result.object.difficulty,
        cuisine_type: result.object.cuisine_type,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ recipe: result.object })
  } catch (error) {
    console.error("Error generating recipe:", error)
    return NextResponse.json({ error: "Failed to generate recipe" }, { status: 500 })
  }
}
