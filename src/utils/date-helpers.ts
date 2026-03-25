// Removed unneeded date-fns imports
/**
 * Calculates the "Trading Day" for a given date.
 * A Trading Day starts at 06:00 AM and ends at 05:59 AM the next calendar day.
 * 
 * Examples:
 * - 2024-05-20 14:00 (2 PM) -> 2024-05-20 (Same day)
 * - 2024-05-20 03:00 (3 AM) -> 2024-05-19 (Previous day, because market didn't open yet)
 * 
 * Returns the `startOfDay` (midnight) of the resulting Trading Day, 
 * making it easy to group and compare dates using `isSameDay`.
 * 
 * @param dateStr ISO Date string or Date object
 * @returns Date object representing midnight of the Trading Day
 */
export function getTradingDay(dateInput: string | Date): Date {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // Apply 5-hour offset (Market opens at 05:00 AM Thai Time)
    // If it's 04:59 AM Tuesday, subtracting 5 hours brings it to 11:59 PM Monday.
    const offsetDate = new Date(d.getTime() - (5 * 60 * 60 * 1000));

    // Format the date to Thailand time explicitly to avoid Vercel UTC shifts
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(offsetDate);
    const p: Record<string, string> = {};
    for (const part of parts) p[part.type] = part.value;

    // Construct the date components
    let year = parseInt(p.year, 10);
    let month = parseInt(p.month, 10);
    let day = parseInt(p.day, 10);

    // Return a guaranteed UTC Date representing midnight of this trading day.
    // This ensures isSameDay compares correctly regardless of the runtime environment.
    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Foolproof string-based evaluation of a Trading Day.
 * Bypasses all JS Date object timezone runtime evaluations.
 * @returns "YYYY-MM-DD"
 */
export function getTradingDayStr(dateInput: string | Date): string {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // Apply 5-hour offset
    const offsetDate = new Date(d.getTime() - (5 * 60 * 60 * 1000));

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(offsetDate);
    const p: Record<string, string> = {};
    for (const part of parts) p[part.type] = part.value;

    let year = parseInt(p.year, 10);
    let month = parseInt(p.month, 10);
    let day = parseInt(p.day, 10);

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
