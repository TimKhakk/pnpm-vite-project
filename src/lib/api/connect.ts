import { LINEAR_TOKEN_API_KEY } from "@/linear-token-api-form/config";

export const api = async <T,>(query: unknown): Promise<T> => {
  const tokenJsonOrNull = localStorage.getItem(LINEAR_TOKEN_API_KEY);
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: tokenJsonOrNull == null ? '' : JSON.parse(tokenJsonOrNull)
    },
    body: JSON.stringify(query),
  })
  const data = await res.json()

  if (!res.ok) {
    throw data
  }

  return data
}
