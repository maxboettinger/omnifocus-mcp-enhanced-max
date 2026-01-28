import { z } from 'zod';
import { getTaskById } from '../primitives/getTaskById.js';
export const schema = z.object({
    taskId: z.string().optional().describe("The ID of the task to retrieve"),
    taskName: z.string().optional().describe("The name of the task to retrieve (alternative to taskId)")
});
export async function handler(args, extra) {
    try {
        // Validate that either taskId or taskName is provided
        if (!args.taskId && !args.taskName) {
            return {
                content: [{
                        type: "text",
                        text: "Error: Either taskId or taskName must be provided."
                    }],
                isError: true
            };
        }
        // Call the getTaskById function 
        const result = await getTaskById(args);
        if (result.success && result.task) {
            const task = result.task;
            // Format task information for display
            let infoText = `📋 **Task Information**\n`;
            infoText += `• **Name**: ${task.name}\n`;
            infoText += `• **ID**: ${task.id}\n`;
            if (task.note) {
                infoText += `• **Note**: ${task.note}\n`;
            }
            if (task.parentId && task.parentName) {
                infoText += `• **Parent Task**: ${task.parentName} (${task.parentId})\n`;
            }
            if (task.projectId && task.projectName) {
                infoText += `• **Project**: ${task.projectName} (${task.projectId})\n`;
            }
            infoText += `• **Has Children**: ${task.hasChildren ? `Yes (${task.childrenCount} subtasks)` : 'No'}\n`;
            return {
                content: [{
                        type: "text",
                        text: infoText
                    }]
            };
        }
        else {
            // Task retrieval failed
            return {
                content: [{
                        type: "text",
                        text: `Failed to retrieve task: ${result.error}`
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
                    text: `Error retrieving task: ${error.message}`
                }],
            isError: true
        };
    }
}
