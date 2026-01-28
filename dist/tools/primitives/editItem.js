import { executeAppleScript } from '../../utils/scriptExecution.js';
import { formatDateForAppleScript } from '../../utils/dateFormatter.js';
/**
 * Generate pure AppleScript for item editing
 */
function generateAppleScript(params) {
    // Sanitize and prepare parameters for AppleScript
    const id = params.id?.replace(/['"\\]/g, '\\$&') || ''; // Escape quotes and backslashes
    const name = params.name?.replace(/['"\\]/g, '\\$&') || '';
    const itemType = params.itemType;
    // Verify we have at least one identifier
    if (!id && !name) {
        return `return "{\\\"success\\\":false,\\\"error\\\":\\\"Either id or name must be provided\\\"}"`;
    }
    // Construct AppleScript with error handling
    let script = `
  try
    tell application "OmniFocus"
      tell front document
        -- Find the item to edit
        set foundItem to missing value
`;
    // Add ID search if provided
    if (id) {
        script += `
        -- Try to find by ID first
        try
          set foundItem to first ${itemType === 'task' ? 'flattened task' : 'flattened project'} where id = "${id}"
        end try
`;
    }
    // Add name search if provided (and no ID or as fallback)
    if (!id && name) {
        script += `
        -- Find by name
        try
          set foundItem to first ${itemType === 'task' ? 'flattened task' : 'flattened project'} where name = "${name}"
        end try
`;
    }
    else if (id && name) {
        script += `
        -- If ID search failed, try to find by name as fallback
        if foundItem is missing value then
          try
            set foundItem to first ${itemType === 'task' ? 'flattened task' : 'flattened project'} where name = "${name}"
          end try
        end if
`;
    }
    // Add the item editing logic
    script += `
        -- If we found the item, edit it
        if foundItem is not missing value then
          set itemName to name of foundItem
          set itemId to id of foundItem as string
          set changedProperties to {}
`;
    // Common property updates for both tasks and projects
    if (params.newName !== undefined) {
        script += `
          -- Update name
          set name of foundItem to "${params.newName.replace(/['"\\]/g, '\\$&')}"
          set end of changedProperties to "name"
`;
    }
    if (params.newNote !== undefined) {
        script += `
          -- Update note
          set note of foundItem to "${params.newNote.replace(/['"\\]/g, '\\$&')}"
          set end of changedProperties to "note"
`;
    }
    if (params.newDueDate !== undefined) {
        if (params.newDueDate === "") {
            script += `
          -- Clear due date
          set due date of foundItem to missing value
          set end of changedProperties to "due date"
`;
        }
        else {
            const formattedDueDate = formatDateForAppleScript(params.newDueDate);
            script += `
          -- Update due date
          set due date of foundItem to date "${formattedDueDate}"
          set end of changedProperties to "due date"
`;
        }
    }
    if (params.newDeferDate !== undefined) {
        if (params.newDeferDate === "") {
            script += `
          -- Clear defer date
          set defer date of foundItem to missing value
          set end of changedProperties to "defer date"
`;
        }
        else {
            const formattedDeferDate = formatDateForAppleScript(params.newDeferDate);
            script += `
          -- Update defer date
          set defer date of foundItem to date "${formattedDeferDate}"
          set end of changedProperties to "defer date"
`;
        }
    }
    if (params.newFlagged !== undefined) {
        script += `
          -- Update flagged status
          set flagged of foundItem to ${params.newFlagged}
          set end of changedProperties to "flagged"
`;
    }
    if (params.newEstimatedMinutes !== undefined) {
        script += `
          -- Update estimated minutes
          set estimated minutes of foundItem to ${params.newEstimatedMinutes}
          set end of changedProperties to "estimated minutes"
`;
    }
    // Task-specific updates
    if (itemType === 'task') {
        // Update task status
        if (params.newStatus !== undefined) {
            if (params.newStatus === 'completed') {
                script += `
          -- Mark task as completed
          set completed of foundItem to true
          set end of changedProperties to "status (completed)"
`;
            }
            else if (params.newStatus === 'dropped') {
                script += `
          -- Mark task as dropped
          set dropped of foundItem to true
          set end of changedProperties to "status (dropped)"
`;
            }
            else if (params.newStatus === 'incomplete') {
                script += `
          -- Mark task as incomplete
          set completed of foundItem to false
          set dropped of foundItem to false
          set end of changedProperties to "status (incomplete)"
`;
            }
        }
        // Move task to a different project
        if (params.newProjectName !== undefined) {
            const projectName = params.newProjectName.replace(/['"\\]/g, '\\$&');
            script += `
          -- Move to new project
          set destProject to missing value
          try
            set destProject to first flattened project where name = "${projectName}"
          end try

          if destProject is not missing value then
            move foundItem to end of tasks of destProject
            set end of changedProperties to "project"
          else
            -- Project not found error
            return "{\\\"success\\\":false,\\\"error\\\":\\\"Project not found: ${projectName}\\\"}"
          end if
`;
        }
        // Handle tag operations
        if (params.replaceTags && params.replaceTags.length > 0) {
            const tagsList = params.replaceTags.map(tag => `"${tag.replace(/['"\\]/g, '\\$&')}"`).join(", ");
            script += `
          -- Replace all tags
          set tagNames to {${tagsList}}
          set existingTags to tags of foundItem
          
          -- First clear all existing tags
          repeat with existingTag in existingTags
            remove existingTag from tags of foundItem
          end repeat
          
          -- Then add new tags
          repeat with tagName in tagNames
            set tagNameStr to tagName as text
            set tagObj to missing value
            try
              set tagObj to first flattened tag where name = tagNameStr
            end try
            if tagObj is missing value then
              set tagObj to make new tag with properties {name:tagNameStr}
            end if
            add tagObj to tags of foundItem
          end repeat
          set end of changedProperties to "tags (replaced)"
`;
        }
        else {
            // Add tags if specified
            if (params.addTags && params.addTags.length > 0) {
                const tagsList = params.addTags.map(tag => `"${tag.replace(/['"\\]/g, '\\$&')}"`).join(", ");
                script += `
          -- Add tags
          set tagNames to {${tagsList}}
          repeat with tagName in tagNames
            set tagNameStr to tagName as text
            set tagObj to missing value
            try
              set tagObj to first flattened tag where name = tagNameStr
            end try
            if tagObj is missing value then
              set tagObj to make new tag with properties {name:tagNameStr}
            end if
            add tagObj to tags of foundItem
          end repeat
          set end of changedProperties to "tags (added)"
`;
            }
            // Remove tags if specified
            if (params.removeTags && params.removeTags.length > 0) {
                const tagsList = params.removeTags.map(tag => `"${tag.replace(/['"\\]/g, '\\$&')}"`).join(", ");
                script += `
          -- Remove tags
          set tagNames to {${tagsList}}
          repeat with tagName in tagNames
            set tagNameStr to tagName as text
            try
              set tagObj to first flattened tag where name = tagNameStr
              remove tagObj from tags of foundItem
            end try
          end repeat
          set end of changedProperties to "tags (removed)"
`;
            }
        }
    }
    // Project-specific updates
    if (itemType === 'project') {
        // Update sequential status
        if (params.newSequential !== undefined) {
            script += `
          -- Update sequential status
          set sequential of foundItem to ${params.newSequential}
          set end of changedProperties to "sequential"
`;
        }
        // Update project status
        if (params.newProjectStatus !== undefined) {
            const statusValue = params.newProjectStatus === 'active' ? 'active status' :
                params.newProjectStatus === 'completed' ? 'done status' :
                    params.newProjectStatus === 'dropped' ? 'dropped status' :
                        'on hold status';
            script += `
          -- Update project status
          set status of foundItem to ${statusValue}
          set end of changedProperties to "status"
`;
        }
        // Move to a new folder
        if (params.newFolderName !== undefined) {
            const folderName = params.newFolderName.replace(/['"\\]/g, '\\$&');
            script += `
          -- Move to new folder
          set destFolder to missing value
          try
            set destFolder to first flattened folder where name = "${folderName}"
          end try
          
          if destFolder is missing value then
            -- Create the folder if it doesn't exist
            set destFolder to make new folder with properties {name:"${folderName}"}
          end if
          
          -- Move project to the folder
          move foundItem to destFolder
          set end of changedProperties to "folder"
`;
        }
    }
    script += `
          -- Prepare the changed properties as a string
          set changedPropsText to ""
          repeat with i from 1 to count of changedProperties
            set changedPropsText to changedPropsText & item i of changedProperties
            if i < count of changedProperties then
              set changedPropsText to changedPropsText & ", "
            end if
          end repeat
          
          -- Return success with details
          return "{\\\"success\\\":true,\\\"id\\\":\\"" & itemId & "\\",\\\"name\\\":\\"" & itemName & "\\",\\\"changedProperties\\\":\\"" & changedPropsText & "\\"}"
        else
          -- Item not found
          return "{\\\"success\\\":false,\\\"error\\\":\\\"Item not found\\\"}"
        end if
      end tell
    end tell
  on error errorMessage
    return "{\\\"success\\\":false,\\\"error\\\":\\"" & errorMessage & "\\"}"
  end try
  `;
    return script;
}
/**
 * Edit a task or project in OmniFocus
 */
export async function editItem(params) {
    try {
        // Generate AppleScript
        const script = generateAppleScript(params);
        console.error("Executing AppleScript for editing...");
        console.error(`Item type: ${params.itemType}, ID: ${params.id || 'not provided'}, Name: ${params.name || 'not provided'}`);
        // Log a preview of the script for debugging (first few lines)
        const scriptPreview = script.split('\n').slice(0, 10).join('\n') + '\n...';
        console.error("AppleScript preview:\n", scriptPreview);
        // Execute AppleScript using temp file (avoids shell escaping issues)
        const stdout = await executeAppleScript(script);
        console.error("AppleScript stdout:", stdout);
        // Parse the result
        try {
            const result = JSON.parse(stdout);
            // Return the result
            return {
                success: result.success,
                id: result.id,
                name: result.name,
                changedProperties: result.changedProperties,
                error: result.error
            };
        }
        catch (parseError) {
            console.error("Error parsing AppleScript result:", parseError);
            return {
                success: false,
                error: `Failed to parse result: ${stdout}`
            };
        }
    }
    catch (error) {
        console.error("Error in editItem execution:", error);
        // Include more detailed error information
        if (error.message && error.message.includes('syntax error')) {
            console.error("This appears to be an AppleScript syntax error. Review the script generation logic.");
        }
        return {
            success: false,
            error: error?.message || "Unknown error in editItem"
        };
    }
}
