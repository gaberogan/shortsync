import { GenerateQuery, OrderBy, QueryType } from 'd1-orm'

export type Statement = {
  bindings: unknown[]
  query: string
}

// Override @cloudflare/workers-types class with better types
export declare abstract class D1TypedStatement<T> {
  bind(...values: unknown[]): D1TypedStatement<T>
  first(colName: keyof T): Promise<T[typeof colName] | null>
  first(): Promise<T | null>
  run(): Promise<D1Result<T>>
  all(): Promise<D1Result<T>>
  raw(): Promise<T[]>
}

// Override @cloudflare/workers-types class with better types
export declare abstract class D1TypedDatabase {
  prepare<T>(query: string): D1TypedStatement<T>
  dump(): Promise<ArrayBuffer>
  exec(query: string): Promise<D1ExecResult>
  batch<T extends Array<unknown>>(
    ...queries: { [K in keyof T]: D1TypedStatement<T[K]> }
  ): Promise<{ [K in keyof T]: D1Result<T[K]> }>
}

/**
 * Select one row
 */
export const selectOneQuery = <T extends Record<string, unknown>>(options: {
  table: string
  where: Partial<T>
  orderBy?: OrderBy<T>
  offset?: number
}) => {
  return selectManyQuery({ ...options, limit: 1 })
}

/**
 * Select multiple rows
 */
export const selectManyQuery = <T extends Record<string, unknown>>({
  table,
  where,
  orderBy,
  limit,
  offset,
}: {
  table: string
  where: Partial<T>
  orderBy?: OrderBy<T>
  limit?: number
  offset?: number
}) => {
  const stmt = GenerateQuery<T>(QueryType.SELECT, table, { where, orderBy, limit, offset })
  return env.DB.prepare<T>(stmt.query).bind(...stmt.bindings)
}

/**
 * Insert a row
 */
export const insertQuery = <T extends Record<string, unknown>>(data: T, { table }: { table: string }) => {
  const stmt = GenerateQuery<T>(QueryType.INSERT, table, { data })
  return env.DB.prepare<T>(stmt.query).bind(...stmt.bindings)
}

/**
 * Insert a row
 */
export const insertOrReplaceQuery = <T extends Record<string, unknown>>(data: T, { table }: { table: string }) => {
  const stmt = GenerateQuery<T>(QueryType.INSERT_OR_REPLACE, table, { data })
  return env.DB.prepare<T>(stmt.query).bind(...stmt.bindings)
}

/**
 * Update a row by uniqueKey
 */
export const updateQuery = <T extends Record<string, unknown>>(
  data: Partial<T>,
  { table, uniqueKey }: { table: string; uniqueKey: string }
) => {
  const stmt = GenerateQuery<T>(
    QueryType.UPDATE,
    table,
    {
      data: data,
      where: { [uniqueKey]: data[uniqueKey] } as Partial<T>,
    },
    uniqueKey
  )

  return env.DB.prepare<T>(stmt.query).bind(...stmt.bindings)
}

/**
 * Upsert a row by uniqueKey
 */
export const upsertQuery = <T extends Record<string, unknown>>(
  data: T,
  { table, uniqueKey, updateColumns }: { table: string; uniqueKey: string; updateColumns: string[] }
) => {
  const stmt = GenerateQuery<T>(
    QueryType.UPSERT,
    table,
    {
      data: data,
      upsertOnlyUpdateData: updateColumns && filterObjectByKeys(data, updateColumns),
      where: { [uniqueKey]: data[uniqueKey] } as Partial<T>,
    },
    uniqueKey
  )

  return env.DB.prepare(stmt.query).bind(...stmt.bindings)
}

/**
 * Helper function to filter object by keys
 */
const filterObjectByKeys = <T extends Record<string, unknown>>(obj: T, keys: string[]) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key))) as Partial<T>
}
