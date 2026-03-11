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

    // Format the date to Thailand time explicitly to avoid Vercel UTC shifts
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(d);
    const p: Record<string, string> = {};
    for (const part of parts) p[part.type] = part.value;

    const hour = parseInt(p.hour, 10);
    const dayOfWeek = parseInt(p.weekday, 10); // 1 = Monday ... 7 = Sunday (if requested in format) OR we use getDay() on the original object 

    // Construct the date components
    let year = parseInt(p.year, 10);
    let month = parseInt(p.month, 10);
    let day = parseInt(p.day, 10);

    // Get the Thai day of week (0 = Sunday, 1 = Monday, 6 = Saturday)
    const thaiDate = new Date(year, month - 1, day);
    const thaiDayOfWeek = thaiDate.getDay();

    if (hour < 6) {
        // Prevent Monday early morning trades from shifting to Sunday (Closed Market)
        if (thaiDayOfWeek !== 1) {
            // Shift back 1 day in UTC safely
            const shifted = new Date(Date.UTC(year, month - 1, day - 1));
            year = shifted.getUTCFullYear();
            month = shifted.getUTCMonth() + 1;
            day = shifted.getUTCDate();
        }
    }

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

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(d);
    const p: Record<string, string> = {};
    for (const part of parts) p[part.type] = part.value;

    const hour = parseInt(p.hour, 10);
    let year = parseInt(p.year, 10);
    let month = parseInt(p.month, 10);
    let day = parseInt(p.day, 10);

    const thaiDate = new Date(year, month - 1, day);
    const thaiDayOfWeek = thaiDate.getDay();

    if (hour < 6) {
        // Prevent Monday early morning trades from shifting to Sunday (Closed Market)
        if (thaiDayOfWeek !== 1) {
            const shifted = new Date(Date.UTC(year, month - 1, day - 1));
            year = shifted.getUTCFullYear();
            month = shifted.getUTCMonth() + 1;
            day = shifted.getUTCDate();
        }
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
