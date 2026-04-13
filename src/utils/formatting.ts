/**
 * Shared display formatting utilities.
 * Centralizing formatting decisions means a single change propagates everywhere.
 */

/**
 * Formats a percentage value for display, rounded to the nearest integer.
 * Example: 67.4 → "67%"
 */
export function formatPercentage(value: number): string {
    return `${Math.round(value)}%`
}

/**
 * Formats an ISO date string to a human-readable date.
 * Example: "2026-04-10T00:00:00Z" → "Apr 10, 2026"
 */
export function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

/**
 * Converts a readiness level to a lowercase CSS module class name.
 * Used when applying color-coded styles keyed to CSS module classes (.low, .medium, .high).
 */
export function readinessClass(level: string): string {
    return level.toLowerCase()
}
