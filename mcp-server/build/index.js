#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
// Connect to the database using the connection string from environment variables
const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
    console.error("Error: SUPABASE_DATABASE_URL or DATABASE_URL environment variable is required.");
    process.exit(1);
}
const pool = new pg.Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false, // Required for Supabase connections from some environments
    },
});
const server = new Server({
    name: "waggli-supabase-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Define available tools
const TOOLS = [
    {
        name: "list_tables",
        description: "List all tables in the public schema",
        inputSchema: {
            type: "object",
            properties: {},
        },
    },
    {
        name: "describe_table",
        description: "Get the schema information (columns, types) for a specific table",
        inputSchema: {
            type: "object",
            properties: {
                table_name: {
                    type: "string",
                    description: "Name of the table to describe",
                },
            },
            required: ["table_name"],
        },
    },
    {
        name: "query_readonly",
        description: "Execute a READ-ONLY SQL query (SELECT only)",
        inputSchema: {
            type: "object",
            properties: {
                sql: {
                    type: "string",
                    description: "The SQL query to execute",
                },
            },
            required: ["sql"],
        },
    },
    {
        name: "execute_sql",
        description: "Execute any SQL query (INSERT, UPDATE, DELETE, etc). Use with caution.",
        inputSchema: {
            type: "object",
            properties: {
                sql: {
                    type: "string",
                    description: "The SQL query to execute",
                },
            },
            required: ["sql"],
        },
    },
];
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: TOOLS,
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const client = await pool.connect();
    try {
        switch (request.params.name) {
            case "list_tables": {
                const result = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name;
        `);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result.rows, null, 2),
                        },
                    ],
                };
            }
            case "describe_table": {
                const { table_name } = request.params.arguments;
                const result = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [table_name]);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result.rows, null, 2),
                        },
                    ],
                };
            }
            case "query_readonly": {
                const { sql } = request.params.arguments;
                if (!sql.trim().toLowerCase().startsWith("select")) {
                    return {
                        content: [{ type: "text", text: "Error: query_readonly only supports SELECT statements." }],
                        isError: true,
                    };
                }
                const result = await client.query(sql);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result.rows, null, 2),
                        },
                    ],
                };
            }
            case "execute_sql": {
                const { sql } = request.params.arguments;
                const result = await client.query(sql);
                // For non-SELECT queries, result.rows might be empty or contain return values if RETURNING is used
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result.rows.length > 0 ? result.rows : { rowCount: result.rowCount }, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new Error("Unknown tool");
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Database Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
    finally {
        client.release();
    }
});
const transport = new StdioServerTransport();
await server.connect(transport);
