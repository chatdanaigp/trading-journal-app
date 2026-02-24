const { startOfDay, subDays, getHours, isSameDay, isSameWeek, isSameMonth } = require('date-fns');

// Mock getTradingDay
function getTradingDay(dateInput) {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const hour = getHours(d);

    // If the hour is before 06:00 AM, it belongs to the previous trading day
    if (hour < 6) {
        return startOfDay(subDays(d, 1));
    }

    // Otherwise, it belongs to the current calendar day
    return startOfDay(d);
}

// Current date
const today = getTradingDay(new Date());
console.log('Today:', today);

// Trade date submitted by form (e.g., today's date "2026-02-23")
const tradeDateStr = "2026-02-23";
const tradeCreatedAt = new Date(tradeDateStr).toISOString(); // Server timezone UTC midnight
console.log('Trade created_at:', tradeCreatedAt);

const tradeDay = getTradingDay(tradeCreatedAt);
console.log('Trade Day:', tradeDay);

console.log('isSameDay:', isSameDay(tradeDay, today));
console.log('isSameWeek:', isSameWeek(tradeDay, today, { weekStartsOn: 1 }));
console.log('isSameMonth:', isSameMonth(tradeDay, today));
