# Noridoc: Tools

Path: @/src/tools

### Overview
MCP tool implementations for OmniFocus operations, organized into primitives (business logic), definitions (MCP protocol layer), and the database dump tool.

### How it fits into the larger codebase

This folder contains all MCP tool implementations that are registered in @/src/server.ts. The server imports tool definitions from @/src/tools/definitions and calls `server.tool()` to expose them to MCP clients. Each tool enables AI assistants to perform OmniFocus operations like task creation, editing, querying, and perspective access.

The folder architecture separates business logic (@/src/tools/primitives) from protocol concerns (@/src/tools/definitions), making the OmniFocus operations reusable independently of MCP.

### Core Implementation

**primitives/** - Contains the core implementation functions that generate AppleScript, execute OmniJS scripts, and handle OmniFocus API calls. These functions return simple result objects with `success`, `error`, and data fields. See @/src/tools/primitives/docs.md for details.

**definitions/** - Contains MCP tool definitions with Zod schemas and handler functions. These wrap primitives, validate input, and format responses into MCP-compliant structures. See @/src/tools/definitions/docs.md for details.

**dumpDatabase.ts** - Special tool that exports the entire OmniFocus database (tasks, projects, folders, tags) by executing @/src/utils/omnifocusScripts/omnifocusDump.js. Transforms the script's output into the `OmnifocusDatabase` type defined in @/src/types.ts. This tool is used primarily for comprehensive database queries but is heavy-weight and includes a 1-second delay after execution to allow OmniFocus to complete its operations.

### Things to Know

**Tool Registration:**
All tools follow a consistent registration pattern in @/src/server.ts:
```typescript
server.tool(
  "tool_name",
  "Tool description",
  toolDefinition.schema.shape,
  toolDefinition.handler
)
```

The tool name uses snake_case (e.g., `add_omnifocus_task`) and the description guides AI assistants on when to use the tool.

**Layer Responsibilities:**
- Primitives: Generate scripts, execute them, parse results, handle errors
- Definitions: Validate parameters, format responses, provide user-friendly messages
- Server: Register tools, provide tool discovery

**Custom Perspective Support:**
The server includes specialized tools for custom perspectives (`list_custom_perspectives`, `get_custom_perspective_tasks`) which access OmniFocus 4.2+ perspective APIs. These tools help distinguish between custom perspective queries and tag-based filtering, a common source of confusion addressed through tool descriptions.

**Database Dump Usage:**
The `dump_database` tool returns comprehensive data but is expensive. It's used when tools need full context (e.g., complex filtering, relationship queries) but most operations use targeted queries instead.

**Batch Operations:**
Batch tools (`batch_add_items`, `batch_remove_items`) reduce round-trip overhead by combining multiple operations into a single AppleScript execution, important for performance when creating or deleting multiple items.

Created and maintained by Nori.
