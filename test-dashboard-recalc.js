require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
// Need to temporarily use the service key to bypass RLS for debugging
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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

    if (hour < 6) {
        const shifted = new Date(Date.UTC(year, month - 1, day - 1));
        year = shifted.getUTCFullYear();
        month = shifted.getUTCMonth() + 1;
        day = shifted.getUTCDate();
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function run() {
    console.log("Fetching trades using service role...");
    const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
        
    if(error) { console.error("Error:", error); return; }
    
    console.log("Found", trades?.length, "trades.");
    let sum10 = 0;
    let sum9 = 0;
    
    trades.forEach(t => {
        const str = getTradingDayStr(t.created_at);
        console.log(`[${str}] Trade ID: ${t.id} | Profit: ${t.profit} | Raw Create: ${t.created_at}`);
        if(str === '2026-03-10') sum10 += Number(t.profit) || 0;
        if(str === '2026-03-09') sum9 += Number(t.profit) || 0;
    });
    
    console.log("\nSum for 10th Array:", sum10);
    console.log("Sum for 9th Array:", sum9);
}
run();
