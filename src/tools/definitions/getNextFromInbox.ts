import { z } from 'zod';
import { getNextFromInbox } from '../primitives/getNextFromInbox.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';

export const schema = z.object({
  // No parameters needed for initial version
});

export async function handler(args: z.infer<typeof schema>, extra: RequestHandlerExtra) {
  try {
    const result = await getNextFromInbox({});

    return {
      content: [{
        type: "text" as const,
        text: result
      }]
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      content: [{
        type: "text" as const,
        text: `Error getting next inbox item: ${errorMessage}`
      }],
      isError: true
    };
  }
}
