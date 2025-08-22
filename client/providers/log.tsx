import { useAPI } from "@/hooks/useAPI";
import { isSuccessResponse } from "@/lib/response";

export async function getUserById (id: number) {
  const { client } = useAPI()
  const request = await client.query('/users/:id', 'get', { id })

  if (isSuccessResponse(request)) return request.data
  console.error(request.message)
  throw new Error(request.message)
}