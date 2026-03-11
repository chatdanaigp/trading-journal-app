import { NextResponse } from 'next/server'

// Simple economic calendar - returns major events for the current week
// In production, this could fetch from ForexFactory RSS or similar APIs
export async function GET() {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Generate realistic upcoming events based on typical forex calendar patterns
    const events = generateCalendarEvents(now)

    return NextResponse.json({ date: today, events })
}

function generateCalendarEvents(now: Date) {
    const events: any[] = []
    const dayOfWeek = now.getDay() // 0=Sun, 1=Mon...

    // Weekly recurring high-impact events (typical forex calendar)
    const weeklyEvents = [
        { day: 1, time: '07:00', title: 'Manufacturing PMI', currency: 'EUR', impact: 'high' },
        { day: 1, time: '15:00', title: 'ISM Manufacturing PMI', currency: 'USD', impact: 'high' },
        { day: 2, time: '05:00', title: 'RBA Interest Rate Decision', currency: 'AUD', impact: 'high' },
        { day: 2, time: '10:00', title: 'CPI (YoY)', currency: 'EUR', impact: 'high' },
        { day: 3, time: '13:15', title: 'ADP Nonfarm Employment', currency: 'USD', impact: 'medium' },
        { day: 3, time: '15:00', title: 'ISM Services PMI', currency: 'USD', impact: 'high' },
        { day: 3, time: '15:30', title: 'Crude Oil Inventories', currency: 'USD', impact: 'medium' },
        { day: 4, time: '07:00', title: 'Services PMI', currency: 'GBP', impact: 'medium' },
        { day: 4, time: '12:15', title: 'ECB Interest Rate Decision', currency: 'EUR', impact: 'high' },
        { day: 4, time: '13:30', title: 'Initial Jobless Claims', currency: 'USD', impact: 'medium' },
        { day: 5, time: '13:30', title: 'Nonfarm Payrolls', currency: 'USD', impact: 'high' },
        { day: 5, time: '13:30', title: 'Unemployment Rate', currency: 'USD', impact: 'high' },
        { day: 5, time: '13:30', title: 'Average Hourly Earnings', currency: 'USD', impact: 'medium' },
    ]

    // Return events from today onwards (up to 3 days)
    for (const evt of weeklyEvents) {
        if (evt.day >= dayOfWeek && evt.day <= dayOfWeek + 2) {
            const evtDate = new Date(now)
            evtDate.setDate(evtDate.getDate() + (evt.day - dayOfWeek))
            const dateStr = evtDate.toISOString().split('T')[0]
            const isToday = evt.day === dayOfWeek

            events.push({
                date: dateStr,
                time: evt.time + ' UTC',
                title: evt.title,
                currency: evt.currency,
                impact: evt.impact,
                isToday
            })
        }
    }

    return events
}
