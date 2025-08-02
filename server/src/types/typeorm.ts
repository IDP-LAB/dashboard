import { type Relation } from 'typeorm'

/**
 * Cria um tipo contendo apenas as propriedades de dados de uma entidade TypeORM.
 * - Remove métodos (funções).
 * - Extrai o tipo interno de uma `Relation<T>`, convertendo `Relation<Item[]>` para `Item[]`.
 */
export type EntityProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K] extends Relation<infer R>
    ? R
    : T[K];
};