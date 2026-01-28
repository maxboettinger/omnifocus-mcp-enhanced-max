import { z } from 'zod';
import { getFlaggedTasks } from '../primitives/getFlaggedTasks.js';
export const schema = z.object({
    hideCompleted: z.boolean().optional().describe("Set to false to show completed flagged tasks (default: true)"),
    projectFilter: z.string().optional().describe("Filter flagged tasks by project name (optional)")
});
export async function handler(args, extra) {
    try {
        const result = await getFlaggedTasks({
            hideCompleted: args.hideCompleted !== false, // Default to true
            projectFilter: args.projectFilter
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
                    text: `Error getting flagged tasks: ${errorMessage}`
                }],
            isError: true
        };
    }
}
