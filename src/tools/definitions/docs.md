# Noridoc: Tool Definitions

Path: @/src/tools/definitions

### Overview
MCP tool definitions that provide Zod schema validation and response formatting for OmniFocus operations. Each definition exports a schema and handler function that wraps a primitive from @/src/tools/primitives.

### How it fits into the larger codebase

These definitions are registered in @/src/server.ts using `server.tool()`, which binds the schema to the handler and exposes the tool to MCP clients. The definitions act as the MCP protocol layer, validating input parameters with Zod schemas and formatting results into MCP-compliant responses with `content` arrays and `isError` flags.

Each definition imports a corresponding primitive from @/src/tools/primitives (e.g., `addOmniFocusTask.ts` imports from `../primitives/addOmniFocusTask.js`) and delegates business logic to it.

### Core Implementation

**Schema Definition Pattern:**
Each file exports a `schema` defined with Zod that describes the tool's parameters. Schemas use `.describe()` to provide parameter documentation that appears in MCP tool listings, helping AI assistants understand parameter semantics.

**Handler Pattern:**
Each file exports a `handler` function with signature:
```typescript
async function handler(args: z.infer<typeof schema>, extra: RequestHandlerExtra)
```

The handler:
1. Validates any cross-parameter constraints (e.g., `editItem` checks that either `id` or `name` is provided)
2. Calls the corresponding primitive function with validated args
3. Interprets the primitive's result to construct a user-friendly message
4. Returns an MCP response object with `content: [{ type: "text", text: "..." }]` and optional `isError: true`

**Response Formatting:**
Successful operations return descriptive messages with relevant context (e.g., "✅ Task 'Review PR' created successfully in project 'Development' due on 1/15/2026 with tags: urgent, review").

Error responses include context about what failed (e.g., "Task not found with ID '...' or name '...'").

### Things to Know

**Tool-Specific Validation:**
- `getNextFromInbox.ts` - Uses an empty Zod schema `z.object({})` since the tool takes no parameters, following YAGNI principle for initial version
- `addOmniFocusTask.ts` - The primitive handles validation of parent task parameters; the definition focuses on response formatting
- `editItem.ts` - Checks that either `id` or `name` is provided before calling the primitive, as the operation cannot proceed without an identifier
- `filterTasks.ts` - Accepts complex filtering parameters (status, dates, project names, tags, search text) with many optional fields

**Parameter Descriptions:**
Schema descriptions provide semantic guidance:
- `editItem.newProjectName`: "Move task to a different project (use exact project name with emoji)" - warns users to include emoji characters if present in project names
- `getCustomPerspectiveTasks`: Explicitly notes these are custom perspectives, not tags, helping AI assistants distinguish between perspective names and tag-based filtering

**Hierarchical Response Formatting:**
`getCustomPerspectiveTasks.ts` processes the `taskMap` returned by its primitive to format tasks in a hierarchical tree structure, using indentation and prefixes to show parent-child relationships in the text response.

**Date Display:**
Definitions format dates for display using `new Date(dateString).toLocaleDateString()`, converting ISO dates to human-readable format in responses.

**Tag Operations:**
`editItem` supports three mutually compatible tag operations but prioritizes `replaceTags` over `addTags`/`removeTags` when formatting the response, as replace is more significant.

**Batch Operation Messages:**
Batch add/remove tools iterate through results to provide per-item success/failure messages, aggregating total counts for summary.

Created and maintained by Nori.
