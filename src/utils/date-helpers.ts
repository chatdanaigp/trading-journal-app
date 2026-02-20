import { startOfDay, subDays, getHours } from 'date-fns'

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

    const hour = getHours(d);

    // If the hour is before 06:00 AM, it belongs to the previous trading day
    if (hour < 6) {
        return startOfDay(subDays(d, 1));
    }

    // Otherwise, it belongs to the current calendar day
    return startOfDay(d);
}
