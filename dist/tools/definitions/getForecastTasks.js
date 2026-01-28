import { z } from 'zod';
import { getForecastTasks } from '../primitives/getForecastTasks.js';
export const schema = z.object({
    days: z.number().min(1).max(30).optional().describe("Number of days to look ahead for forecast (default: 7)"),
    hideCompleted: z.boolean().optional().describe("Set to false to show completed tasks in forecast (default: true)"),
    includeDeferredOnly: z.boolean().optional().describe("Set to true to show only deferred tasks becoming available (default: false)")
});
export async function handler(args, extra) {
    try {
        const result = await getForecastTasks({
            days: args.days || 7,
            hideCompleted: args.hideCompleted !== false, // Default to true
            includeDeferredOnly: args.includeDeferredOnly || false
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
                    text: `Error getting forecast tasks: ${errorMessage}`
                }],
            isError: true
        };
    }
}
