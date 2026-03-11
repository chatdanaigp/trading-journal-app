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

// Data from Screenshot 2: "Recent Transactions"
// 1. -$50 at 10/3/2569 17:08 (5:08 PM)
// 2. +$60 at 10/3/2569 17:08 (5:08 PM)
// 3. -$5  at 10/3/2569 16:10 (4:10 PM)
// 4. +$200 at 10/3/2569 01:44 (1:44 AM - This is BEFORE 6 AM!)

// Let's create mock Dates that represent these assuming the server stores them in UTC.
// If the UI shows "10/3/2569 17:08" it means March 10, Thailand Time 17:08
// In UTC, this is March 10, 10:08 UTC
const t1 = new Date(Date.UTC(2026, 2, 10, 10, 8)); // 17:08 Thai
const t2 = new Date(Date.UTC(2026, 2, 10, 10, 8)); // 17:08 Thai
const t3 = new Date(Date.UTC(2026, 2, 10, 9, 10));  // 16:10 Thai
const t4 = new Date(Date.UTC(2026, 2, 9, 18, 44));  // 01:44 Thai (Next day 1 AM)

console.log("Trade 1 (-$50, 17:08): mapped to ->", getTradingDayStr(t1)); 
console.log("Trade 2 (+$60, 17:08): mapped to ->", getTradingDayStr(t2));
console.log("Trade 3 (-$5,  16:10): mapped to ->", getTradingDayStr(t3));
console.log("Trade 4 (+$200, 01:44): mapped to ->", getTradingDayStr(t4));

