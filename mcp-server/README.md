# Supabase MCP Server for Waggly

This is a Model Context Protocol (MCP) server that provides access to the Waggly Supabase database.
It allows AI assistants (like Claude, Cursor, Trae) to directly query the database schema and data.

## Prerequisites

- Node.js installed
- A Supabase project with a database password

## Installation

1. Navigate to this directory:
   ```bash
   cd mcp-server
   npm install
   npm run build
   ```

## Configuration

You need to add this server to your MCP client configuration (e.g., `claude_desktop_config.json` or IDE settings).

### Connection String
You need your Supabase PostgreSQL connection string. It typically looks like:
`postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

Replace `[password]` with your actual database password.

### Configuration Example

Add the following to your MCP settings:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": [
        "/Users/antonkhrabrov/Workspace/Projects/Waggly/Waggli-New/mcp-server/build/index.js"
      ],
      "env": {
        "SUPABASE_DATABASE_URL": "postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
      }
    }
  }
}
```

## Available Tools

- `list_tables`: List all tables in the public schema.
- `describe_table`: Get the schema (columns, types) for a specific table.
- `query_readonly`: Execute a SELECT query safely.
- `execute_sql`: Execute any SQL query (INSERT, UPDATE, DELETE, etc.). **Use with caution.**

## Development

To run in development mode:
```bash
npm run dev
```
(Requires `SUPABASE_DATABASE_URL` in `.env` file)
