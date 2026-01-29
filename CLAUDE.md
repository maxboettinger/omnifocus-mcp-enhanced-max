# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that enables AI assistants to interact with OmniFocus on macOS. The server exposes 16+ tools for task management, including custom perspective access, hierarchical task display, and advanced filtering capabilities.

## Build and Development Commands

### Build
```bash
npm run build
```
Compiles TypeScript to `dist/`, copies OmniJS scripts from `src/utils/omnifocusScripts/` to `dist/utils/omnifocusScripts/`, and makes the server executable.

### Watch Mode
```bash
npm run dev
```
Runs TypeScript compiler in watch mode for development.

### Start Server
```bash
npm start
# or directly:
node dist/server.js
```

### Testing
This project uses manual testing with OmniFocus. The npm test script is a placeholder that always passes.

## Architecture

### Core Components

**MCP Server (`src/server.ts`)**
- Creates an `McpServer` instance using `@modelcontextprotocol/sdk`
- Registers all tools with name, description, schema, and handler
- Connects via stdio transport for JSON-RPC communication with MCP clients (like Claude Desktop)

**Three-Layer Architecture:**
1. **Tool Definitions** (`src/tools/definitions/`) - MCP protocol layer with Zod schemas and handler functions
2. **Tool Primitives** (`src/tools/primitives/`) - Business logic that generates AppleScript or invokes OmniJS scripts
3. **Script Execution** (`src/utils/scriptExecution.ts`) - Execution layer that writes scripts to temp files and runs via `osascript`

**Script Types:**
- **AppleScript** - Used for CRUD operations (create, edit, delete tasks/projects) via `executeAppleScript()`
- **OmniJS** - JavaScript-based OmniFocus scripting used for queries and perspective access via `executeOmniFocusScript()`
- **JXA** - JavaScript for Automation used as a wrapper to execute OmniJS scripts via `app.evaluateJavascript()`

**OmniJS Scripts** (`src/utils/omnifocusScripts/*.js`)
These are NOT TypeScript files - they're pure JavaScript/OmniJS scripts that are:
- Copied verbatim during build (not compiled)
- Loaded and executed at runtime via `executeOmniFocusScript()`
- Parameterized via string injection (prepending `const injectedArgs = {...}`)

### Type System

Two parallel type systems:
- **External Types** (`src/types.ts`) - `OmnifocusTask`, `OmnifocusProject`, etc. used in MCP responses
- **Internal Types** (`src/omnifocustypes.ts`) - Minimal interfaces matching OmniFocus's native API

## Critical Implementation Details

### Date Handling - MUST READ

**Problem:** AppleScript's date parsing is locale-dependent and breaks on non-English systems.

**Solution:** Dates are constructed programmatically by setting numeric properties:
```applescript
-- CORRECT - locale-independent
set tempDate to current date
set year of tempDate to 2026
set month of tempDate to 1
set day of tempDate to 28
set time of tempDate to 0
```

**CRITICAL:** Date construction MUST happen OUTSIDE any `tell application "OmniFocus"` block. If you construct dates inside a tell block, AppleScript tries to resolve properties like `year` in the application's context, causing error -1723.

**Pattern to follow:**
1. Generate date construction code at script beginning using `formatDateForAppleScript()`
2. Create unique variable names (dueDateVar, deferDateVar, etc.)
3. Place ALL date construction BEFORE the `tell application "OmniFocus"` block
4. Reference the pre-constructed variables inside the tell block

See `src/utils/dateFormatter.ts` and error history in `src/utils/docs.md` for full context.

### Script Execution Pattern

All scripts use temp file execution (not command-line arguments) to avoid shell escaping issues:
1. Write script content to temp file in `tmpdir()`
2. Execute via `osascript` (AppleScript) or `osascript -l JavaScript` (JXA)
3. Parse JSON output
4. Clean up temp file in finally block

For OmniJS scripts, `executeOmniFocusScript()` handles:
- Path resolution (works in both dev and compiled contexts)
- Parameter injection via string replacement
- Double-escaping for embedding in JXA wrappers

## Tool Categories

**CRUD Operations:**
- `add_omnifocus_task` - Create tasks with dates, tags, parent tasks
- `add_project` - Create projects with sequential/parallel settings
- `edit_item` - Modify task/project properties, including tag operations (add/remove/replace)
- `remove_item` - Delete tasks or projects
- `get_task_by_id` - Retrieve single task with subtask hierarchy

**Batch Operations:**
- `batch_add_items` - Create multiple tasks/projects in one operation
- `batch_remove_items` - Delete multiple items by ID

**Perspective Queries:**
- `get_inbox_tasks` - Inbox perspective
- `get_next_from_inbox` - Get the oldest item from inbox following GTD workflow
- `get_flagged_tasks` - Flagged tasks with optional project filtering
- `get_forecast_tasks` - Due/deferred tasks in date range
- `get_tasks_by_tag` - Filter by OmniFocus tags (NOT perspective names)
- `get_today_completed_tasks` - Today's accomplishments

**Advanced Filtering:**
- `filter_tasks` - Multi-criteria filtering (status, dates, projects, tags, search)

**Custom Perspectives (OmniFocus 4.2+):**
- `list_custom_perspectives` - List all custom perspective names
- `get_custom_perspective_tasks` - Query by perspective name with hierarchical tree display

## Important Distinctions

**Tags vs Perspectives:**
- Tags are labels assigned to individual tasks (`@home`, `@work`)
- Perspectives are saved views/filters with custom rules
- Use `get_tasks_by_tag` for tag filtering
- Use `get_custom_perspective_tasks` for perspective queries

**Subtask Creation:**
- Cannot specify both `parentTaskId` and `parentTaskName`
- Cannot specify both a parent task and a project (subtasks inherit parent's project)
- `validateParentTaskParams()` enforces these constraints

## Package Configuration

- ES modules (`"type": "module"`)
- Node.js 18+ required
- macOS only (`"os": ["darwin"]`)
- Main entry: `dist/server.js`
- CLI executable: `cli.cjs` (CommonJS wrapper)

## MCP Client Configuration

Example for Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "omnifocus": {
      "command": "npx",
      "args": ["omnifocus-mcp-enhanced"]
    }
  }
}
```

## Documentation System

This codebase uses the Noridoc documentation system with `docs.md` files throughout the source tree. These provide architectural context and implementation details at each directory level.
