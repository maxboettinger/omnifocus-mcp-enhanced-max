import { removeItem } from './removeItem.js';
/**
 * Remove multiple items (tasks or projects) from OmniFocus
 */
export async function batchRemoveItems(items) {
    try {
        // Results array to track individual operation outcomes
        const results = [];
        // Process each item in sequence
        for (const item of items) {
            try {
                // Remove item
                const itemResult = await removeItem(item);
                results.push({
                    success: itemResult.success,
                    id: itemResult.id,
                    name: itemResult.name,
                    error: itemResult.error
                });
            }
            catch (itemError) {
                // Handle individual item errors
                results.push({
                    success: false,
                    error: itemError.message || "Unknown error processing item"
                });
            }
        }
        // Determine overall success (true if at least one item was removed successfully)
        const overallSuccess = results.some(result => result.success);
        return {
            success: overallSuccess,
            results: results
        };
    }
    catch (error) {
        console.error("Error in batchRemoveItems:", error);
        return {
            success: false,
            results: [],
            error: error.message || "Unknown error in batchRemoveItems"
        };
    }
}
