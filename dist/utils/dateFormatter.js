/**
 * Utility functions for date formatting
 */
/**
 * Convert ISO date string to locale-independent AppleScript date construction
 *
 * PROBLEM: AppleScript's `date "28 January 2026"` is locale-dependent.
 * English month names fail on German systems with error -30720.
 *
 * SOLUTION: Construct dates by setting numeric properties (year, month, day, time)
 * which is locale-independent and works on all systems.
 *
 * @param isoDate ISO date string (e.g., "2026-01-09" or "2026-01-09T12:00:00")
 * @returns Variable name (e.g., "dateVar123456") to use in AppleScript.
 *          Call getDateConstructionScript() to get the initialization code.
 * @throws Error if the date string is invalid
 */
export function formatDateForAppleScript(isoDate) {
    if (!isoDate || isoDate.trim() === '') {
        throw new Error('Date string cannot be empty');
    }
    // Parse the ISO date string
    const date = new Date(isoDate);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date string: ${isoDate}`);
    }
    // Extract date components
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed, AppleScript is 1-indexed
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    // Calculate time in seconds since midnight for AppleScript's time property
    const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    // Generate AppleScript code to construct the date
    // NOTE: Set year first, then month, then day to avoid date rollover issues
    // (e.g., setting day to 31 when current month is February would cause problems)
    return [
        `set tempDate to current date`,
        `set year of tempDate to ${year}`,
        `set month of tempDate to ${month}`,
        `set day of tempDate to ${day}`,
        `set time of tempDate to ${timeInSeconds}`
    ].join('\n          ');
}
