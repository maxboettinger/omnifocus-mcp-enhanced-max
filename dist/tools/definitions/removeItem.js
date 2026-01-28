import { z } from 'zod';
import { removeItem } from '../primitives/removeItem.js';
export const schema = z.object({
    id: z.string().optional().describe("The ID of the task or project to remove"),
    name: z.string().optional().describe("The name of the task or project to remove (as fallback if ID not provided)"),
    itemType: z.enum(['task', 'project']).describe("Type of item to remove ('task' or 'project')")
});
export async function handler(args, extra) {
    try {
        // Validate that either id or name is provided
        if (!args.id && !args.name) {
            return {
                content: [{
                        type: "text",
                        text: "Either id or name must be provided to remove an item."
                    }],
                isError: true
            };
        }
        // Validate itemType
        if (!['task', 'project'].includes(args.itemType)) {
            return {
                content: [{
                        type: "text",
                        text: `Invalid item type: ${args.itemType}. Must be either 'task' or 'project'.`
                    }],
                isError: true
            };
        }
        // Log the remove operation for debugging
        console.error(`Removing ${args.itemType} with ID: ${args.id || 'not provided'}, Name: ${args.name || 'not provided'}`);
        // Call the removeItem function 
        const result = await removeItem(args);
        if (result.success) {
            // Item was removed successfully
            const itemTypeLabel = args.itemType === 'task' ? 'Task' : 'Project';
            return {
                content: [{
                        type: "text",
                        text: `✅ ${itemTypeLabel} "${result.name}" removed successfully.`
                    }]
            };
        }
        else {
            // Item removal failed
            let errorMsg = `Failed to remove ${args.itemType}`;
            if (result.error) {
                if (result.error.includes("Item not found")) {
                    errorMsg = `${args.itemType.charAt(0).toUpperCase() + args.itemType.slice(1)} not found`;
                    if (args.id)
                        errorMsg += ` with ID "${args.id}"`;
                    if (args.name)
                        errorMsg += `${args.id ? ' or' : ' with'} name "${args.name}"`;
                    errorMsg += '.';
                }
                else {
                    errorMsg += `: ${result.error}`;
                }
            }
            return {
                content: [{
                        type: "text",
                        text: errorMsg
                    }],
                isError: true
            };
        }
    }
    catch (err) {
        const error = err;
        console.error(`Tool execution error: ${error.message}`);
        return {
            content: [{
                    type: "text",
                    text: `Error removing ${args.itemType}: ${error.message}`
                }],
            isError: true
        };
    }
}
