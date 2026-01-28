# Noridoc: Utilities

Path: @/src/utils

### Overview
Core utilities for script execution, date formatting, and the perspective engine that enables advanced task filtering using OmniFocus 4.2+ APIs.

### How it fits into the larger codebase

This folder provides the execution layer between the MCP server and OmniFocus. Tools in @/src/tools/primitives call `executeAppleScript()` or `executeOmniFocusScript()` to run scripts that manipulate OmniFocus data. The perspective engine (@/src/utils/perspectiveEngine.ts) provides programmatic perspective filtering, while date utilities ensure correct date format conversions between ISO 8601 and AppleScript's expected format.

Scripts in @/src/utils/omnifocusScripts are loaded and executed by the functions in this folder, with parameter injection handled by `executeOmniFocusScript()`.

### Core Implementation

**scriptExecution.ts:**
Provides three main execution modes:
- `executeAppleScript()` - Writes AppleScript to a temp file and executes via `osascript`
- `executeJXA()` - Writes JavaScript to a temp file and executes via `osascript -l JavaScript`
- `executeOmniFocusScript()` - Loads a script from @/src/utils/omnifocusScripts, injects parameters, wraps it in JXA, and executes via `app.evaluateJavascript()`

The `executeOmniFocusScript()` function handles script path resolution across different installation contexts (dist vs src), parameter injection by prepending `injectedArgs` declarations, and escape handling for embedding scripts within JXA wrappers.

**dateFormatter.ts:**
Generates locale-independent AppleScript code to construct dates from ISO date strings (YYYY-MM-DD). Returns multi-line AppleScript that creates a `tempDate` variable by programmatically setting year, month, day, and time properties using numeric values. This approach avoids AppleScript's locale-dependent date string parsing (e.g., `date "28 January 2026"` fails with error -30720 on German systems) by constructing dates through property assignment instead.

**perspectiveEngine.ts:**
Implements a `PerspectiveEngine` class that filters tasks based on OmniFocus 4.2+ perspective rules. The engine defines `PerspectiveRule` interfaces matching OmniFocus's rule types (availability, status, tags, dates, projects). The `getFilteredTasks()` method queries OmniFocus perspectives, applies additional filtering (hide completed, limit), and returns structured task results with perspective metadata.

### Things to Know

**Temp File Execution:**
All script execution writes to temp files in `tmpdir()` rather than passing scripts via command-line arguments. This avoids shell escaping issues with quotes, backslashes, and special characters that plagued earlier implementations.

**Parameter Injection Mechanism:**
`executeOmniFocusScript()` uses string replacement to inject parameters into script files. It prepends a `const injectedArgs = {...}` block and then replaces hardcoded parameter declarations with references to `injectedArgs`. This allows scripts to be parameterized without modifying the script files themselves.

**Double-Escaping for JXA:**
When embedding OmniJS scripts in JXA wrappers, `executeOmniFocusScript()` performs escaping on backslashes, backticks, and dollar signs to prevent template literal interpretation issues in the `evaluateJavascript()` call.

**Perspective Engine Limitations:**
The `PerspectiveEngine` includes Chinese comments indicating it's designed for OmniFocus 4.2+ APIs but implements a simplified filtering layer. The `getTasksFromPerspective()` method includes hardcoded logic for specific perspective names (e.g., "今日复盘" for completed tasks) suggesting incomplete generalization of the perspective rule system.

**Script Path Resolution:**
`executeOmniFocusScript()` checks multiple paths (dist, src, relative) to locate scripts, enabling the code to work both in development and after TypeScript compilation.

**Locale-Dependent Date Parsing Bug:**
AppleScript's `date "28 January 2026"` syntax is locale-dependent and fails with error -30720 on non-English systems. The original implementation in commit b6f096b used English month names assuming they would work universally. This broke on German systems where AppleScript expects German month names. The fix (current implementation) constructs dates programmatically by setting numeric properties (`year`, `month`, `day`, `time`), which is locale-independent. The `formatDateForAppleScript()` function returns AppleScript code that creates a `tempDate` variable through property assignment rather than string parsing.

Created and maintained by Nori.
