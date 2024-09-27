import { LINEAR_TOKEN_API_KEY } from "@/linear-token-api-form/config"
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts"

export const useLinearTokenApiLocalStorage = () => {
  const [value, setValue, removeValue] = useLocalStorage<string | null>(LINEAR_TOKEN_API_KEY, null)

  return {
    value, setValue, removeValue
  }
}
export const useReadLinearTokenApiLocalStorage = () => {
  const v = useReadLocalStorage<string | null>(LINEAR_TOKEN_API_KEY)
  return v == null ? null : JSON.parse(v)
}
