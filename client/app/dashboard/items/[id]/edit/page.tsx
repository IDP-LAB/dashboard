"use client"

import { ItemForm } from "@/components/item-form"
import { useAPI } from "@/hooks/useAPI"
import { isSuccessResponse } from "@/lib/response"
import { useQuery } from "@tanstack/react-query"

export default function EditItemPage({ params }: { params: { id: string } }) {
  const { client } = useAPI()
  const { data, isFetching } = useQuery({
    queryKey: ['item', params.id],
    queryFn: async () => await client.query('/item/:id', 'get', {
      id: params.id
    }, undefined)
  })

  if (isFetching) return <p>Carregando...</p>
  if (!isSuccessResponse(data)) throw new Error(data?.message)

  return (
    <div className="max-w-4xl mx-auto">
      <ItemForm item={data.data} />
    </div>
  )
}
