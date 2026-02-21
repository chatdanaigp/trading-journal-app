import { cookies } from 'next/headers'

export type Language = 'EN' | 'TH'

export const dictionaries = {
    EN: {
        dashboard: {
            overview: "Overview",
            welcome: "Welcome back, let's grow your portfolio.",
            netProfit: "Net Profit",
            winRate: "Win Rate",
            vsLastPeriod: "vs last period",
            totalTrades: "Total Trades",
            pointsThisMonth: "Points (This Month)",
            today: "Today",
            thisWeek: "This Week",
            recentTransactions: "Recent Transactions",
            viewJournal: "View Journal",
            noTradesWait: "No trades yet.",
            quickTrade: "Quick Trade",
            myForest: "My Forest",
            goalTarget: "Goal Target",
            currentProfit: "Current Profit",
            setGoals: "Set Goals",
            asset: "Asset",
            sideLot: "Side / Lot",
            price: "Price",
            result: "Result",
            analysis: "Analysis",
            analytics: "Analytics",
            leaderboard: "Leaderboard",
            journal: "Journal",
            adminPanel: "Admin Panel",
            settings: "Settings",
            help: "Help",
            logout: "Log Out",
        },
        tradeForm: {
            symbol: "Symbol / Asset",
            type: "Trade Type",
            lotSize: "Lot Size",
            entryPrice: "Entry Price",
            exitPrice: "Exit Price",
            profitLoss: "Profit / Loss ($)",
            date: "Date & Time",
            notes: "Notes (Optional)",
            addTrade: "Add Trade",
            logging: "Logging...",
        },
        sidebar: {
            dashboard: "Dashboard",
            analytics: "Analytics",
            leaderboard: "Leaderboard",
            journal: "Journal",
            adminPanel: "Admin Panel",
            settings: "Settings",
            help: "Help",
            logout: "Log Out"
        }
    },
    TH: {
        dashboard: {
            overview: "ภาพรวม",
            welcome: "ยินดีต้อนรับกลับมา ลุยปั้นพอร์ตกันต่อเลย",
            netProfit: "กำไรสุทธิ",
            winRate: "อัตราชนะ (Win Rate)",
            vsLastPeriod: "เทียบกับช่วงก่อน",
            totalTrades: "จำนวนเทรดทั้งหมด",
            pointsThisMonth: "ระยะ (Points) เดือนนี้",
            today: "วันนี้",
            thisWeek: "สัปดาห์นี้",
            recentTransactions: "รายการล่าสุด",
            viewJournal: "ดูบันทึกทั้งหมด",
            noTradesWait: "ยังไม่มีรายการเทรด",
            quickTrade: "บันทึกเทรดด่วน",
            myForest: "ป่ากำไรของฉัน",
            goalTarget: "เป้าหมาย",
            currentProfit: "กำไรปัจจุบัน",
            setGoals: "ตั้งเป้าหมาย",
            asset: "สินทรัพย์",
            sideLot: "ฝั่ง / หลอด",
            price: "ราคาเข้า-ออก",
            result: "กำไร/ขาดทุน",
            analysis: "วิเคราะห์",
        },
        tradeForm: {
            symbol: "ชื่อสินทรัพย์",
            type: "ฝั่งเทรด",
            lotSize: "ขนาด Lot",
            entryPrice: "ราคาเข้า (Entry)",
            exitPrice: "ราคาออก (Exit)",
            profitLoss: "กำไร / ขาดทุน ($)",
            date: "วันที่และเวลา",
            notes: "บันทึกเพิ่มเติม",
            addTrade: "บันทึกเทรด",
            logging: "กำลังบันทึก...",
        },
        sidebar: {
            dashboard: "หน้าหลัก",
            analytics: "วิเคราะห์ผล",
            leaderboard: "ตารางผู้นำ",
            journal: "สมุดบันทึก",
            adminPanel: "จัดการระบบ",
            settings: "ตั้งค่า",
            help: "ช่วยเหลือ",
            logout: "ออกจากระบบ"
        }
    }
}

export function getDictionary(lang: Language) {
    return dictionaries[lang]
}

export async function getCurrentLanguage(): Promise<Language> {
    const cookieStore = await cookies()
    const tjsLang = cookieStore.get('tj_language')?.value as Language
    return tjsLang === 'TH' ? 'TH' : 'EN'
}
