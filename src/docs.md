# Noridoc: Source Code

Path: @/src

### Overview
TypeScript source code for an MCP (Model Context Protocol) server that provides AI assistants with comprehensive OmniFocus task management capabilities through AppleScript and OmniJS execution.

### How it fits into the larger codebase

This is the core source directory that gets compiled to @/dist by TypeScript. The entry point is @/src/server.ts, which creates an MCP server, registers all tools, and connects via stdio transport. The codebase is organized into tools (@/src/tools), utilities (@/src/utils), and type definitions (omnifocustypes.ts, types.ts).

After compilation, @/dist/server.js is executed by MCP clients (like Claude Desktop) via the stdio transport defined in the client's configuration.

### Core Implementation

**server.ts** - MCP server entry point that:
- Creates an `McpServer` instance from `@modelcontextprotocol/sdk`
- Imports tool definitions from @/src/tools/definitions
- Registers 16+ tools using `server.tool(name, description, schema, handler)`
- Connects the server to stdio transport for MCP communication
- Groups tools into categories: CRUD operations, perspective tools, filtering, batch operations, custom perspectives

**types.ts** - Defines the exported data structures:
- `OmnifocusTask` - Complete task representation with dates, tags, status, hierarchy, and metadata
- `OmnifocusProject` - Project structure with folder relationships and task lists
- `OmnifocusFolder` - Folder hierarchy with nested projects and subfolders
- `OmnifocusTag` - Tag structure with parent relationships
- `OmnifocusDatabase` - Root structure containing all entities

**omnifocustypes.ts** - Defines TypeScript interfaces that mirror OmniFocus's native type system:
- Enums for `Task.Status`, `Project.Status`, `Folder.Status`, `Tag.Status`
- Minimal interfaces (`TaskMinimal`, `ProjectMinimal`, etc.) used for type-safe script interactions
- `DatabaseObject` interface with `id.primaryKey` structure matching OmniFocus's ID system

**tools/** - All MCP tool implementations organized as primitives (business logic) and definitions (protocol layer). See @/src/tools/docs.md.

**utils/** - Script execution utilities, date formatting, and perspective engine. See @/src/utils/docs.md.

### Things to Know

**MCP Protocol:**
The server uses the Model Context Protocol from Anthropic, which enables AI assistants to call tools via stdio. The protocol defines a standard for tool discovery, parameter validation (via Zod schemas), and response formatting. The server runs as a long-lived process that receives JSON-RPC messages and responds with tool results.

**Tool Organization:**
The server registers tools in groups based on functionality. Comments in server.ts delineate sections:
- Basic CRUD (add_task, remove_item, edit_item, get_task_by_id)
- Batch operations (batch_add_items, batch_remove_items)
- Perspective queries (get_inbox_tasks, get_flagged_tasks, get_forecast_tasks)
- Advanced filtering (filter_tasks)
- Custom perspectives (list_custom_perspectives, get_custom_perspective_tasks)

**AppleScript vs OmniJS:**
The codebase uses two scripting approaches:
- AppleScript for CRUD operations (task creation, editing, deletion) via `executeAppleScript()`
- OmniJS (JavaScript for OmniFocus) for queries and perspectives via `executeOmniFocusScript()`

OmniJS provides richer APIs for perspective access and tree traversal, while AppleScript is used for simple property manipulation.

**Type System:**
The type system includes both external types (types.ts) used in tool responses and internal types (omnifocustypes.ts) matching OmniFocus's API surface. The `dumpDatabase` function transforms between OmniFocus's internal representation and the exported `OmnifocusDatabase` format.

**Async Execution:**
All tool handlers are async functions that await script execution. The server uses promisified child_process.exec for running osascript commands, with temp file management for script content.

**Version Support:**
Comments in perspectiveEngine.ts indicate support for OmniFocus 4.2+ APIs, particularly for custom perspective access. The server works on macOS only (specified in package.json `os: ["darwin"]`).

Created and maintained by Nori.
