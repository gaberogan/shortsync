import { GenerateQuery, QueryType } from 'd1-orm'

export type Statement = {
  bindings: unknown[]
  query: string
}

export type User = {
  id: string
  google_id: string
  email: string
  image: string
  first_name: string
  last_name: string
  locale: string
}

/**
 * Run query and return all data and metadata
 */
export const all = (stmt: Statement) => {
  return env.DB.prepare(stmt.query).bind(stmt.bindings).all()
}

/**
 * Run query and return only metadata. Ideal for UPDATE, DELETE or INSERT
 */
export const run = (stmt: Statement) => {
  return env.DB.prepare(stmt.query).bind(stmt.bindings).all()
}

/**
 * Upsert data to a table with a given conflict key
 */
export const upsert = <T extends Record<string, unknown>>(
  data: T,
  { table, conflictKey }: { table: string; conflictKey: string }
) => {
  return run(
    GenerateQuery<T>(
      QueryType.UPSERT,
      table,
      {
        data: data,
        upsertOnlyUpdateData: data,
        where: { [conflictKey]: data[conflictKey] } as Partial<T>,
      },
      conflictKey
    )
  )
}
