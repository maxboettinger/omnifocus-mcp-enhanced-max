# Noridoc: OmniFocus MCP Enhanced

Path: @/

### Overview
An MCP (Model Context Protocol) server that provides AI assistants like Claude with comprehensive OmniFocus task management capabilities, including custom perspective access, hierarchical task operations, and advanced filtering.

### How it fits into the larger codebase

This is the repository root containing source code (@/src), compiled output (@/dist), configuration files, and documentation. The package is distributed via npm as `omnifocus-mcp-enhanced` and can be installed globally or linked into MCP client configurations.

MCP clients (like Claude Desktop) invoke this server via stdio transport by executing the CLI wrapper (@/cli.cjs) or directly running `node dist/server.js`. The server maintains a persistent connection over stdio, receiving tool invocation requests and responding with results.

### Core Implementation

**Entry Points:**
- `cli.cjs` - CommonJS CLI wrapper that spawns `dist/server.js` with experimental module support
- `dist/server.js` - Compiled MCP server entry point (from @/src/server.ts)

**Source Code (@/src):**
TypeScript source implementing the MCP server, tool definitions, primitives, and utilities. Organized into:
- Server setup and tool registration
- Tool implementations (CRUD, queries, perspectives, batch operations)
- Script execution layer (AppleScript and OmniJS)
- Type definitions for OmniFocus data structures

See @/src/docs.md for architecture details.

**Build System:**
- `tsconfig.json` - TypeScript configuration targeting ES2022 with module type ES2022
- `package.json` - Defines build scripts, dependencies (@modelcontextprotocol/sdk, zod), and package metadata
- Build command: `tsc && npm run copy-files && chmod 755 dist/server.js`
- Copy-files step: Copies @/src/utils/omnifocusScripts/*.js to @/dist/utils/omnifocusScripts/

**Script Files:**
JavaScript files in @/src/utils/omnifocusScripts are not TypeScript-compiled; they're JXA and OmniJS scripts copied verbatim to dist during build and executed by osascript at runtime.

**Distribution:**
The package is configured with:
- `main: "dist/server.js"` - Entry point for programmatic usage
- `bin: { "omnifocus-mcp-enhanced": "./cli.cjs" }` - CLI executable
- `type: "module"` - ES module package
- `engines: { "node": ">=18.0.0" }` - Node.js version requirement
- `os: ["darwin"]` - macOS only (OmniFocus requirement)

### Things to Know

**MCP Integration:**
MCP clients configure this server in their settings (e.g., Claude Desktop's `claude_desktop_config.json`) with:
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

The server communicates via stdio JSON-RPC, receiving tool invocation requests and responding with structured results.

**Build Process:**
TypeScript compilation produces ES modules in @/dist with corresponding .js files. The copy-files step ensures OmniJS scripts are available at runtime. The chmod step makes server.js executable as a shebang script (#!/usr/bin/env node).

**Version History:**
The current version (1.6.1) emphasizes custom perspective access as a "killer feature" (see package.json keywords). The description highlights "Native Custom Perspective Access" and "hierarchical task display" as key differentiators.

**OmniFocus Version:**
Comments in source code and documentation reference OmniFocus 4.2+ APIs, particularly for perspective access. The package targets the modern OmniFocus API surface with OmniJS support.

**Perspective Engine:**
A core feature is the PerspectiveEngine (@/src/utils/perspectiveEngine.ts) which enables programmatic perspective filtering. This allows AI assistants to query custom perspectives by name, retrieve perspective-filtered task sets, and access hierarchical task relationships as they appear in perspective views.

**Error Handling:**
Script execution failures are caught and formatted into MCP error responses with `isError: true`. AppleScript and OmniJS errors are propagated from temp file execution through primitives to tool definitions, where they're formatted into user-friendly error messages.

**Documentation:**
- `README.md` - User-facing setup and usage documentation
- `perspective.html.md` - Extended documentation on perspective functionality
- `docs.md` files throughout @/src - Internal architecture documentation (this Noridoc system)

Created and maintained by Nori.
