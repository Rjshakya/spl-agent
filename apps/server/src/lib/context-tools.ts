import { Effect } from "effect";
import { DatabaseContextError } from "../services/context-service";
import { createDB } from "../db/instance";

/**
 * Get all tables from a PostgreSQL database
 */
export function getTables(
  connectionString: string,
): Effect.Effect<string[], DatabaseContextError> {
  return Effect.gen(function* () {
    const db = yield* Effect.tryPromise({
      try: () => createDB(connectionString),
      catch: (error) =>
        new DatabaseContextError({
          message: "Failed to create database connection",
          cause: error,
          step: "getTables/createDB",
        }),
    });

    const result = yield* Effect.tryPromise({
      try: async () => {
        const tables = await db.execute(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `);
        return (tables.rows as Array<{ table_name: string }>).map(
          (row) => row.table_name,
        );
      },
      catch: (error) =>
        new DatabaseContextError({
          message: "Failed to fetch tables from database",
          cause: error,
          step: "getTables/query",
        }),
    });

    return result;
  });
}


/**
 * Interface for column information
 */
export interface ColumnInfo {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimary: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
}

/**
 * Get all columns and their types for a specific table
 */
export function getTableColumns(
  connectionString: string,
  tableName: string,
): Effect.Effect<ColumnInfo[], DatabaseContextError> {
  return Effect.gen(function* () {
    const db = yield* Effect.tryPromise({
      try: () => createDB(connectionString),
      catch: (error) =>
        new DatabaseContextError({
          message: "Failed to create database connection",
          cause: error,
          step: "getTableColumns/createDB",
        }),
    });

    // Get column information
    const columnsResult = yield* Effect.tryPromise({
      try: async () => {
        const columns = await db.execute(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = '${tableName}'
          ORDER BY ordinal_position
        `);
        return columns.rows as Array<{
          column_name: string;
          data_type: string;
          is_nullable: string;
          column_default: string | null;
        }>;
      },
      catch: (error) =>
        new DatabaseContextError({
          message: `Failed to fetch columns for table ${tableName}`,
          cause: error,
          step: "getTableColumns/columns",
        }),
    });

    // Get primary key information
    const primaryKeysResult = yield* Effect.tryPromise({
      try: async () => {
        const primaryKeys = await db.execute(`
          SELECT kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_name = '${tableName}'
        `);
        return (primaryKeys.rows as Array<{ column_name: string }>).map(
          (row) => row.column_name,
        );
      },
      catch: (error) =>
        new DatabaseContextError({
          message: `Failed to fetch primary keys for table ${tableName}`,
          cause: error,
          step: "getTableColumns/primaryKeys",
        }),
    });

    // Get foreign key information
    const foreignKeysResult = yield* Effect.tryPromise({
      try: async () => {
        const foreignKeys = await db.execute(`
          SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = '${tableName}'
        `);
        return foreignKeys.rows as Array<{
          column_name: string;
          foreign_table_name: string;
          foreign_column_name: string;
        }>;
      },
      catch: (error) =>
        new DatabaseContextError({
          message: `Failed to fetch foreign keys for table ${tableName}`,
          cause: error,
          step: "getTableColumns/foreignKeys",
        }),
    });

    // Combine all information
    const primaryKeySet = new Set(primaryKeysResult);
    const foreignKeyMap = new Map(
      foreignKeysResult.map((fk) => [
        fk.column_name,
        { table: fk.foreign_table_name, column: fk.foreign_column_name },
      ]),
    );

    const columns: ColumnInfo[] = columnsResult.map((col) => ({
      name: col.column_name,
      type: col.data_type,
      isNullable: col.is_nullable === "YES",
      isPrimary: primaryKeySet.has(col.column_name),
      foreignKey: foreignKeyMap.get(col.column_name),
    }));

    return columns;
  });
}