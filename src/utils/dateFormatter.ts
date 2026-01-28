/**
 * Utility functions for date formatting
 */

/**
 * Convert ISO date string to locale-independent AppleScript date construction
 *
 * PROBLEM: AppleScript's `date "28 January 2026"` is locale-dependent.
 * English month names fail on German systems with error -30720.
 *
 * ADDITIONAL PROBLEM: Setting date properties inside a `tell application` block
 * causes error -1723 (errAEPrivilegeViolation) because AppleScript tries to resolve
 * `year of tempDate` as an application property instead of a system date property.
 *
 * SOLUTION: Construct dates by setting numeric properties (year, month, day, time)
 * which is locale-independent, AND generate the construction code to run OUTSIDE
 * the tell application block, then pass the constructed date variable into the block.
 *
 * @param isoDate ISO date string (e.g., "2026-01-09" or "2026-01-09T12:00:00")
 * @param varName Optional variable name (default: "tempDate")
 * @returns AppleScript code that constructs the date in the specified variable
 * @throws Error if the date string is invalid
 */
export function formatDateForAppleScript(isoDate: string, varName: string = 'tempDate'): string {
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
	// IMPORTANT: This code must run OUTSIDE any `tell application` block to avoid
	// error -1723 where AppleScript tries to resolve date properties in app context
	return [
		`set ${varName} to current date`,
		`set year of ${varName} to ${year}`,
		`set month of ${varName} to ${month}`,
		`set day of ${varName} to ${day}`,
		`set time of ${varName} to ${timeInSeconds}`
	].join('\n')
}
