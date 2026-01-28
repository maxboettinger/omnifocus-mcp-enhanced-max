import { z } from 'zod';
import { listCustomPerspectives } from '../primitives/listCustomPerspectives.js';
export const schema = z.object({
    format: z.enum(['simple', 'detailed']).optional().describe("Output format: simple (names only) or detailed (with identifiers) - default: simple")
});
export async function handler(args, extra) {
    try {
        const result = await listCustomPerspectives({
            format: args.format || 'simple'
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
                    text: `Error listing custom perspectives: ${errorMessage}`
                }],
            isError: true
        };
    }
}
