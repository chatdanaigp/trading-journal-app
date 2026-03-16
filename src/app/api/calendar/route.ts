import { NextResponse } from 'next/server'

// Forex Factory free JSON API
const FF_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json'

// Gold/Forex related currencies
const RELEVANT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF', 'CNY']

function generateAnalysis(event: any): string {
    const { title, country, impact, forecast, previous } = event
    const titleLower = title.toLowerCase()

    // Interest rate events
    if (titleLower.includes('rate') && (titleLower.includes('interest') || titleLower.includes('policy') || titleLower.includes('federal funds') || titleLower.includes('bank rate') || titleLower.includes('cash rate') || titleLower.includes('overnight'))) {
        return `🏦 การตัดสินใจอัตราดอกเบี้ย — ส่งผลกระทบต่อค่าเงิน ${country} โดยตรง หากขึ้นดอกเบี้ย ค่าเงินมีแนวโน้มแข็งค่า หากคงที่หรือลด ค่าเงินอาจอ่อนค่า ระวังความผันผวนสูงช่วงประกาศ`
    }

    // CPI / Inflation
    if (titleLower.includes('cpi') || titleLower.includes('inflation')) {
        return `📊 ดัชนีเงินเฟ้อ — หากตัวเลขสูงกว่าคาด อาจส่งสัญญาณว่าธนาคารกลางจะขึ้นดอกเบี้ย ทำให้ค่าเงิน ${country} แข็งค่า ส่งผลต่อราคาทองคำผกผัน`
    }

    // Employment / NFP
    if (titleLower.includes('nonfarm') || titleLower.includes('employment') || titleLower.includes('jobless') || titleLower.includes('unemployment') || titleLower.includes('claimant')) {
        return `👷 ข้อมูลตลาดแรงงาน — ตัวเลขดีกว่าคาดจะหนุนค่าเงิน ${country} และกดดันราคาทองคำ ตัวเลขแย่กว่าคาดจะดันราคาทองขึ้น เพราะตลาดคาดว่า Fed จะผ่อนคลายนโยบาย`
    }

    // GDP
    if (titleLower.includes('gdp')) {
        return `📈 ผลิตภัณฑ์มวลรวมในประเทศ — วัดสุขภาพเศรษฐกิจของ ${country} หากสูงกว่าคาดหมาย ค่าเงินมีแนวโน้มแข็งค่า ราคาทองอาจปรับตัวลง`
    }

    // PMI
    if (titleLower.includes('pmi')) {
        return `🏭 ดัชนีผู้จัดการฝ่ายจัดซื้อ — สะท้อนภาคการผลิต/บริการ หากสูงกว่า 50 = ขยายตัว, ต่ำกว่า 50 = หดตัว ส่งผลต่อค่าเงิน ${country}`
    }

    // PPI
    if (titleLower.includes('ppi') || titleLower.includes('producer price')) {
        return `🏭 ดัชนีราคาผู้ผลิต — เป็นตัวบ่งชี้เงินเฟ้อล่วงหน้า หากสูงกว่าคาดอาจกดดันให้ธนาคารกลางขึ้นดอกเบี้ย`
    }

    // Retail Sales
    if (titleLower.includes('retail sales')) {
        return `🛒 ยอดค้าปลีก — สะท้อนกำลังซื้อของผู้บริโภค หากสูงกว่าคาดจะหนุนค่าเงิน ${country} แสดงว่าเศรษฐกิจเติบโตดี`
    }

    // FOMC / Fed
    if (titleLower.includes('fomc') || titleLower.includes('fed')) {
        return `🇺🇸 การประชุม FOMC — กำหนดทิศทางนโยบายการเงินสหรัฐ ส่งผลกระทบสูงต่อดอลลาร์และทองคำ ระวังความผันผวนรุนแรง`
    }

    // ECB
    if (titleLower.includes('ecb')) {
        return `🇪🇺 การประชุม ECB — กำหนดทิศทางนโยบายการเงินยูโรโซน ส่งผลต่อค่าเงินยูโรและคู่เงินที่เกี่ยวข้อง`
    }

    // BOJ
    if (titleLower.includes('boj')) {
        return `🇯🇵 การประชุม BOJ — กำหนดนโยบายการเงินญี่ปุ่น ส่งผลต่อค่าเงินเยนและอาจกระทบทองคำ`
    }

    // BOE
    if (titleLower.includes('boe') || titleLower.includes('mpc') || (titleLower.includes('monetary policy') && country === 'GBP')) {
        return `🇬🇧 การประชุม BOE — กำหนดนโยบายการเงินอังกฤษ ส่งผลต่อค่าเงินปอนด์`
    }

    // BOC
    if (titleLower.includes('boc')) {
        return `🇨🇦 การประชุม BOC — กำหนดนโยบายการเงินแคนาดา ส่งผลต่อค่าเงินดอลลาร์แคนาดา`
    }

    // SNB
    if (titleLower.includes('snb')) {
        return `🇨🇭 การประชุม SNB — กำหนดนโยบายการเงินสวิตเซอร์แลนด์ ส่งผลต่อค่าเงินฟรังก์`
    }

    // RBA
    if (titleLower.includes('rba')) {
        return `🇦🇺 การประชุม RBA — กำหนดนโยบายการเงินออสเตรเลีย ส่งผลต่อค่าเงินดอลลาร์ออสเตรเลีย`
    }

    // Trump / President speaks
    if (titleLower.includes('president') || titleLower.includes('trump')) {
        return `🎙️ คำแถลงของประธานาธิบดี — อาจส่งผลกระทบต่อตลาดอย่างรุนแรงหากมีประกาศเรื่องภาษี/การค้า ระวังความผันผวนสูง`
    }

    // Oil
    if (titleLower.includes('crude oil') || titleLower.includes('oil inventories')) {
        return `🛢️ ข้อมูลน้ำมัน — ส่งผลต่อค่าเงิน CAD และอาจกระทบตลาดโดยรวม หากสต็อกน้ำมันสูงขึ้น ราคาน้ำมันอาจลดลง`
    }

    // Trade Balance
    if (titleLower.includes('trade balance')) {
        return `⚖️ ดุลการค้า — แสดงความแตกต่างระหว่างมูลค่าส่งออกและนำเข้า ส่งผลต่อค่าเงิน ${country} ในระยะกลาง`
    }

    // Housing
    if (titleLower.includes('housing') || titleLower.includes('home sales') || titleLower.includes('home prices')) {
        return `🏠 ข้อมูลภาคอสังหาริมทรัพย์ — สะท้อนสุขภาพเศรษฐกิจและความเชื่อมั่นผู้บริโภค ส่งผลต่อค่าเงิน ${country}`
    }

    // Default
    if (impact === 'High') {
        return `⚡ ข่าวสำคัญสำหรับ ${country} — อาจสร้างความผันผวนสูงในตลาด ควรระวังและพิจารณาลดขนาดการเทรดรอบช่วงเวลาประกาศ`
    }

    return `📋 ข้อมูลเศรษฐกิจจาก ${country}${forecast ? ` คาดการณ์: ${forecast}` : ''}${previous ? ` ครั้งก่อน: ${previous}` : ''}`
}

export async function GET() {
    try {
        const res = await fetch(FF_URL, {
            next: { revalidate: 300 } // Cache for 5 minutes
        })

        if (!res.ok) {
            return NextResponse.json({ events: [], error: 'Failed to fetch calendar data' })
        }

        const rawEvents = await res.json()

        // Get today's date in Thailand timezone
        const nowTH = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
        const todayStr = `${nowTH.getFullYear()}-${String(nowTH.getMonth() + 1).padStart(2, '0')}-${String(nowTH.getDate()).padStart(2, '0')}`

        const events = rawEvents
            .filter((evt: any) => RELEVANT_CURRENCIES.includes(evt.country))
            .map((evt: any) => {
                // Parse date and convert to Thailand time (GMT+7)
                const utcDate = new Date(evt.date)
                const thDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000) + (utcDate.getTimezoneOffset() * 60 * 1000))

                const thDateStr = `${thDate.getFullYear()}-${String(thDate.getMonth() + 1).padStart(2, '0')}-${String(thDate.getDate()).padStart(2, '0')}`
                const thTimeStr = `${String(thDate.getHours()).padStart(2, '0')}:${String(thDate.getMinutes()).padStart(2, '0')}`

                const impact = (evt.impact || 'Low').toLowerCase()
                const isToday = thDateStr === todayStr

                return {
                    date: thDateStr,
                    time: thTimeStr,
                    timezone: 'TH (GMT+7)',
                    title: evt.title,
                    currency: evt.country,
                    impact: impact === 'holiday' ? 'low' : impact,
                    isToday,
                    forecast: evt.forecast || null,
                    previous: evt.previous || null,
                    analysis: generateAnalysis({ ...evt, impact }),
                    isHoliday: impact === 'holiday',
                }
            })
            .sort((a: any, b: any) => {
                // Sort by date then time
                if (a.date !== b.date) return a.date.localeCompare(b.date)
                return a.time.localeCompare(b.time)
            })

        return NextResponse.json({ date: todayStr, events })

    } catch (error) {
        console.error('Calendar API error:', error)
        return NextResponse.json({ events: [], error: 'Failed to fetch calendar data' })
    }
}
