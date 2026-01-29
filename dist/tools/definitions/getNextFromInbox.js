import { z } from 'zod';
import { getNextFromInbox } from '../primitives/getNextFromInbox.js';
export const schema = z.object({
// No parameters needed for initial version
});
export async function handler(args, extra) {
    try {
        const result = await getNextFromInbox({});
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
                    text: `Error getting next inbox item: ${errorMessage}`
                }],
            isError: true
        };
    }
}
