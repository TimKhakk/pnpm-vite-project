export const api = async <T,>(query: unknown): Promise<T> => {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: import.meta.env.VITE_LINEAR_API_TOKEN
    },
    body: JSON.stringify(query),
  })

  return res.json()
}
