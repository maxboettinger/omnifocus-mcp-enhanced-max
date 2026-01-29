import { executeOmniFocusScript } from '../../utils/scriptExecution.js';

export interface GetNextFromInboxOptions {
  // Currently no options needed - kept for future extensibility
}

export async function getNextFromInbox(options: GetNextFromInboxOptions = {}): Promise<string> {
  try {
    // Execute the getNextFromInbox script
    const result = await executeOmniFocusScript('@getNextFromInbox.js', {});

    if (typeof result === 'string') {
      return result;
    }

    // If result is an object, format it
    if (result && typeof result === 'object') {
      const data = result as any;

      if (!data.success) {
        throw new Error(data.error || 'Failed to get next inbox item');
      }

      // If no task found (inbox empty or no active tasks)
      if (!data.task) {
        return "📭 Inbox is empty - well done!";
      }

      // Format the single task for display
      const task = data.task;
      let output = `# 🎯 NEXT FROM INBOX\n\n`;

      const flagSymbol = task.flagged ? '🚩 ' : '';
      output += `**Task:** ${flagSymbol}${task.name}\n`;
      output += `**ID:** ${task.id}\n`;
      output += `**Status:** ${task.taskStatus}\n`;

      if (task.added) {
        const addedDate = new Date(task.added);
        output += `**Added:** ${addedDate.toLocaleDateString()} ${addedDate.toLocaleTimeString()}\n`;
      }

      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        output += `**Due:** ${dueDate.toLocaleDateString()}\n`;
      }

      if (task.deferDate) {
        const deferDate = new Date(task.deferDate);
        output += `**Defer Until:** ${deferDate.toLocaleDateString()}\n`;
      }

      if (task.estimatedMinutes) {
        output += `**Estimated Time:** ${task.estimatedMinutes} minutes\n`;
      }

      if (task.tags && task.tags.length > 0) {
        const tagNames = task.tags.map((tag: any) => tag.name).join(', ');
        output += `**Tags:** ${tagNames}\n`;
      }

      if (task.note && task.note.trim()) {
        output += `\n**Note:**\n${task.note.trim()}\n`;
      }

      return output;
    }

    return "Unexpected result format from OmniFocus";

  } catch (error) {
    console.error("Error in getNextFromInbox:", error);
    throw new Error(`Failed to get next inbox item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
