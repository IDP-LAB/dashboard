import { Item } from '@/database/entity/Item'
import { ItemCategory } from '@/database/entity/ItemCategory'
import { ItemTag } from '@/database/entity/ItemTag'
import { ItemStatus, ItemType } from '@/database/enums'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { nanoid } from 'nanoid' // Importar nanoid

const NUM_ITEM_GROUPS = 15
const MIN_QTY_PER_GROUP = 3
const MAX_QTY_PER_GROUP = 10

/**
 * Garante que as categorias de item padrão existam no banco de dados.
 */
async function ensureItemCategories(): Promise<ItemCategory[]> {
  let categories = await ItemCategory.find()
  if (categories.length === 0) {
    console.log('  - Criando categorias de item padrão...')
    const categoryNames = ['Eletrônicos', 'Mobiliário', 'Ferramentas', 'Material de Escritório', 'Componentes']
    const categoriesToCreate = categoryNames.map(name => ItemCategory.create({ name }))
    categories = await ItemCategory.save(categoriesToCreate)
    console.log('  ✓ Categorias de item criadas.')
  }
  return categories
}

/**
 * Garante que as tags de item padrão existam no banco de dados.
 */
async function ensureItemTags(): Promise<ItemTag[]> {
  let tags = await ItemTag.find()
  if (tags.length === 0) {
    console.log('  - Criando tags de item padrão...')
    const tagNames = ['Vermelho', 'Azul', 'Verde', 'Novo', 'Usado', 'Importado', 'Nacional', 'Marca A', 'Marca B']
    const tagsToCreate = tagNames.map(name => ItemTag.create({ name }))
    tags = await ItemTag.save(tagsToCreate)
    console.log('  ✓ Tags de item criadas.')
  }
  return tags
}

/**
 * Função principal para popular o banco de dados com itens de teste.
 * O script só é executado se não houver itens existentes.
 */
export async function registerItems() {
  const itemCount = await Item.count()
  if (itemCount > 0) {
    console.log(`ℹ️ ${itemCount} item(s) já existem. O script de criação de itens foi ignorado.`)
    return
  }
  
  console.log(`Nenhum item encontrado. Criando ${NUM_ITEM_GROUPS} grupos de itens em estoque...`)

  const availableCategories = await ensureItemCategories()
  const availableTags = await ensureItemTags()

  const allItemsToSave: Item[] = []

  for (let i = 0; i < NUM_ITEM_GROUPS; i++) {
    const quantity = faker.number.int({ min: MIN_QTY_PER_GROUP, max: MAX_QTY_PER_GROUP })
    
    // Propriedades compartilhadas para todos os itens deste grupo
    const sharedProperties = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      location: `Prateleira ${faker.string.alphanumeric(2).toUpperCase()}`,
      category: faker.helpers.arrayElement(availableCategories),
      tags: faker.helpers.arrayElements(availableTags, { min: 1, max: 3 }),
      type: faker.helpers.arrayElement(Object.values(ItemType)),
      status: ItemStatus.Available,
      project: null
    }
    
    console.log(`  - Criando grupo "${sharedProperties.name}" com ${quantity} unidades.`)

    const groupUuid = nanoid()

    for (let j = 0; j < quantity; j++) {
      const item = Item.create({
        ...sharedProperties,
        groupUuid: groupUuid,
      })
      allItemsToSave.push(item)
    }
  }
  
  await Item.save(allItemsToSave)

  console.log(`\n✓ ${allItemsToSave.length} itens no total foram criados e adicionados ao estoque.`)
}