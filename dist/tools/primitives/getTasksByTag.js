import { executeOmniFocusScript } from '../../utils/scriptExecution.js';
export async function getTasksByTag(options) {
    const { tagName, hideCompleted = true, exactMatch = false } = options;
    if (!tagName || tagName.trim() === '') {
        throw new Error('Tag name is required');
    }
    try {
        // Execute the tasks by tag script
        const result = await executeOmniFocusScript('@tasksByTag.js', {
            tagName: tagName.trim(),
            hideCompleted: hideCompleted,
            exactMatch: exactMatch
        });
        if (typeof result === 'string') {
            return result;
        }
        // If result is an object, format it
        if (result && typeof result === 'object') {
            const data = result;
            if (data.error) {
                throw new Error(data.error);
            }
            // Format the tasks by tag
            const searchType = exactMatch ? 'exact match' : 'partial match';
            let output = `# 🏷 TASKS WITH TAG: "${tagName}" (${searchType})\n\n`;
            if (data.matchedTags && data.matchedTags.length > 0) {
                output += `**Matched tags**: ${data.matchedTags.join(', ')}\n\n`;
            }
            if (data.tasks && Array.isArray(data.tasks)) {
                if (data.tasks.length === 0) {
                    output += `No tasks found with tag "${tagName}"\n`;
                    if (data.availableTags && data.availableTags.length > 0) {
                        output += `\n**Available tags**: ${data.availableTags.slice(0, 10).join(', ')}`;
                        if (data.availableTags.length > 10) {
                            output += ` ... and ${data.availableTags.length - 10} more`;
                        }
                        output += '\n';
                    }
                }
                else {
                    const taskCount = data.tasks.length;
                    output += `Found ${taskCount} task${taskCount === 1 ? '' : 's'}:\n\n`;
                    // Group tasks by project for better organization
                    const tasksByProject = new Map();
                    data.tasks.forEach((task) => {
                        const projectName = task.projectName || '📥 Inbox';
                        if (!tasksByProject.has(projectName)) {
                            tasksByProject.set(projectName, []);
                        }
                        tasksByProject.get(projectName).push(task);
                    });
                    // Display tasks grouped by project
                    tasksByProject.forEach((tasks, projectName) => {
                        if (tasksByProject.size > 1) {
                            output += `## 📁 ${projectName}\n`;
                        }
                        tasks.forEach((task) => {
                            const flagSymbol = task.flagged ? '🚩 ' : '';
                            const dueDateStr = task.dueDate ? ` [DUE: ${new Date(task.dueDate).toLocaleDateString()}]` : '';
                            const deferDateStr = task.deferDate ? ` [DEFER: ${new Date(task.deferDate).toLocaleDateString()}]` : '';
                            const statusStr = task.taskStatus !== 'Available' ? ` (${task.taskStatus})` : '';
                            const estimateStr = task.estimatedMinutes ? ` ⏱${task.estimatedMinutes}m` : '';
                            output += `• ${flagSymbol}${task.name}${dueDateStr}${deferDateStr}${statusStr}${estimateStr}\n`;
                            if (task.note && task.note.trim()) {
                                output += `  📝 ${task.note.trim()}\n`;
                            }
                            // Show all tags for this task
                            if (task.tags && task.tags.length > 0) {
                                const tagNames = task.tags.map((tag) => {
                                    // Highlight the matched tag
                                    return data.matchedTags && data.matchedTags.includes(tag.name)
                                        ? `**${tag.name}**`
                                        : tag.name;
                                }).join(', ');
                                output += `  🏷 ${tagNames}\n`;
                            }
                            output += '\n';
                        });
                    });
                    // Summary
                    output += `📊 **Summary**: ${taskCount} task${taskCount === 1 ? '' : 's'} with tag "${tagName}"\n`;
                }
            }
            else {
                output += "No tasks data available\n";
            }
            return output;
        }
        return "Unexpected result format from OmniFocus";
    }
    catch (error) {
        console.error("Error in getTasksByTag:", error);
        throw new Error(`Failed to get tasks by tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
