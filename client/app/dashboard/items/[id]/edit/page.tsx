// Esta página seria para carregar o item específico e passá-lo para o ItemForm.
// Por enquanto, vamos simular que o item é carregado.
import { ItemForm } from "@/components/item-form"
import { mockItems } from "@/lib/data" // Usando dados mocados

// No Next.js real, você usaria params para buscar o item.
// export default async function EditItemPage({ params }: { params: { id: string } }) {
// const item = await fetchItemById(params.id); // Função para buscar o item

export default function EditItemPage({ params }: { params: { id: string } }) {
  // Simulação de busca de item
  const item = mockItems.find((i) => i.id === params.id)

  if (!item) {
    return <div className="text-center py-10">Item não encontrado.</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ItemForm item={item} />
    </div>
  )
}
