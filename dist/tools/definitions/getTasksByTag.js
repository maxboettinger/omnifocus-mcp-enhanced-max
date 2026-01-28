import { z } from 'zod';
import { getTasksByTag } from '../primitives/getTasksByTag.js';
export const schema = z.object({
    tagName: z.string().describe("Name of the tag to filter tasks by"),
    hideCompleted: z.boolean().optional().describe("Set to false to show completed tasks with this tag (default: true)"),
    exactMatch: z.boolean().optional().describe("Set to true for exact tag name match, false for partial (default: false)")
});
export async function handler(args, extra) {
    try {
        const result = await getTasksByTag({
            tagName: args.tagName,
            hideCompleted: args.hideCompleted !== false, // Default to true
            exactMatch: args.exactMatch || false
        });
        return {
            content: [{
                    type: "text",
                    text: result
                }]
        };
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        return {
            content: [{
                    type: "text",
                    text: `Error getting tasks by tag: ${errorMessage}`
                }],
            isError: true
        };
    }
}
