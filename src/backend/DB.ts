import { GenerateQuery, QueryType } from 'd1-orm'

export type Statement = {
  bindings: unknown[]
  query: string
}

/**
 * Upsert data to a table with a given conflict key
 */
export const upsert = async <T extends Record<string, unknown>>(
  data: T,
  { table, conflictKey, updateFields }: { table: string; conflictKey: string; updateFields?: string[] }
) => {
  await run(
    GenerateQuery<T>(
      QueryType.UPSERT,
      table,
      {
        data: data,
        upsertOnlyUpdateData: updateFields && filterObjectByKeys(data, updateFields),
        where: { [conflictKey]: data[conflictKey] } as Partial<T>,
      },
      conflictKey
    )
  )
  return data
}

/**
 * Run query and return all data and metadata
 */
const all = (stmt: Statement) => {
  return env.DB.prepare(stmt.query)
    .bind(...stmt.bindings)
    .all()
}

/**
 * Run query and return only metadata. Ideal for UPDATE, DELETE or INSERT
 */
const first = <T>(stmt: Statement) => {
  return env.DB.prepare(stmt.query)
    .bind(...stmt.bindings)
    .first() as Promise<T>
}

/**
 * Run query and return only metadata. Ideal for UPDATE, DELETE or INSERT
 */
const run = (stmt: Statement) => {
  return env.DB.prepare(stmt.query)
    .bind(...stmt.bindings)
    .all()
}

/**
 * Helper function to filter object by keys
 */
const filterObjectByKeys = <T extends Record<string, unknown>>(obj: T, keys: string[]) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key))) as Partial<T>
}
