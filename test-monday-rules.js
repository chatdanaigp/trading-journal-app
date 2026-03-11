function getTradingDayStr(dateInput) {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', hour12: false
    });
    const parts = formatter.formatToParts(d);
    const p = {};
    for (const part of parts) p[part.type] = part.value;

    const hour = parseInt(p.hour, 10);
    let year = parseInt(p.year, 10);
    let month = parseInt(p.month, 10);
    let day = parseInt(p.day, 10);

    // Any trade before 06:00 AM belongs to the PREVIOUS day
    if (hour < 6) {
        const shifted = new Date(Date.UTC(year, month - 1, day - 1));
        year = shifted.getUTCFullYear();
        month = shifted.getUTCMonth() + 1;
        day = shifted.getUTCDate();
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// What if the user traded on Monday March 9th at 03:00 AM?
// Our rule: if hour < 6, shift to PREVIOUS day.
// Monday March 9th minus 1 day = Sunday March 8th.

const t1 = new Date(Date.UTC(2026, 2, 8, 20, 0)); // Monday 03:00 AM Thai Time
console.log("Monday 03:00 AM goes to:", getTradingDayStr(t1));

// If market opens Monday at 05:00 AM (Thai time) for Gold, 
// any trade between 05:00 and 06:00 AM Monday will be classified as Sunday under the strict < 6 rule!
const t2 = new Date(Date.UTC(2026, 2, 8, 22, 0)); // Monday 05:00 AM Thai Time
console.log("Monday 05:00 AM goes to:", getTradingDayStr(t2));

