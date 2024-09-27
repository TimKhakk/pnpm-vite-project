import { LINEAR_TOKEN_API_KEY } from "@/linear-token-api-form/config"
import { z } from "zod"

export const linearTokenApiSchema = z.object({
  [LINEAR_TOKEN_API_KEY]: z.string().min(2).max(50),
})
