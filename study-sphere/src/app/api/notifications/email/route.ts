import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface Session {
  title: string
  startTime: string
  endTime: string
  subject: string
  date: string
}

interface EmailRequest {
  email: string
  name: string
  sessions: Session[]
  type: 'daily' | 'weekly'
  language: string
  weeklyStats?: {
    totalSessions: number
    totalHours: number
    totalNotes: number
  }
}

function buildDailyEmailHtml(name: string, sessions: Session[], language: string) {
  const isKo = language === 'ko'
  const title = isKo ? '오늘의 학습 일정' : "Today's Study Schedule"
  const greeting = isKo ? `안녕하세요, ${name}님!` : `Hi ${name}!`
  const noSessions = isKo ? '오늘 예정된 학습 세션이 없습니다.' : 'No study sessions scheduled for today.'
  const scheduleTitle = isKo ? '오늘의 일정' : "Today's Schedule"
  const footer = isKo ? 'StudySphere에서 보냈습니다' : 'Sent from StudySphere'

  const sessionRows = sessions.map(s => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
        <strong style="color: #1f2937;">${s.title}</strong><br/>
        <span style="color: #6b7280; font-size: 14px;">${s.startTime} - ${s.endTime} · ${s.subject}</span>
      </td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; margin-top: 0;">${greeting}</p>
          ${sessions.length === 0
            ? `<p style="color: #6b7280; text-align: center; padding: 24px;">${noSessions}</p>`
            : `
              <h3 style="color: #1f2937; margin-bottom: 12px;">${scheduleTitle}</h3>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px;">
                ${sessionRows}
              </table>
            `
          }
        </div>
        <div style="padding: 16px 32px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">${footer}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function buildWeeklyEmailHtml(name: string, stats: { totalSessions: number; totalHours: number; totalNotes: number }, language: string) {
  const isKo = language === 'ko'
  const title = isKo ? '주간 학습 리포트' : 'Weekly Study Report'
  const greeting = isKo ? `안녕하세요, ${name}님!` : `Hi ${name}!`
  const summary = isKo ? '지난주 학습 요약입니다.' : "Here's your study summary for last week."
  const sessionsLabel = isKo ? '학습 세션' : 'Study Sessions'
  const hoursLabel = isKo ? '학습 시간' : 'Study Hours'
  const notesLabel = isKo ? '작성한 노트' : 'Notes Created'
  const footer = isKo ? 'StudySphere에서 보냈습니다' : 'Sent from StudySphere'

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; margin-top: 0;">${greeting}</p>
          <p style="color: #6b7280;">${summary}</p>
          <div style="display: flex; gap: 16px; margin-top: 24px;">
            <div style="flex: 1; background: #eef2ff; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #4f46e5;">${stats.totalSessions}</div>
              <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">${sessionsLabel}</div>
            </div>
            <div style="flex: 1; background: #eef2ff; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #4f46e5;">${stats.totalHours}h</div>
              <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">${hoursLabel}</div>
            </div>
            <div style="flex: 1; background: #eef2ff; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #4f46e5;">${stats.totalNotes}</div>
              <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">${notesLabel}</div>
            </div>
          </div>
        </div>
        <div style="padding: 16px 32px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">${footer}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()
    const { email, name, sessions, type, language, weeklyStats } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const isKo = language === 'ko'
    let subject: string
    let html: string

    if (type === 'weekly' && weeklyStats) {
      subject = isKo ? '📊 StudySphere 주간 학습 리포트' : '📊 StudySphere Weekly Study Report'
      html = buildWeeklyEmailHtml(name, weeklyStats, language)
    } else {
      subject = isKo ? '📅 StudySphere 오늘의 학습 일정' : "📅 StudySphere Today's Study Schedule"
      html = buildDailyEmailHtml(name, sessions || [], language)
    }

    const { data, error } = await resend.emails.send({
      from: 'StudySphere <onboarding@resend.dev>',
      to: [email],
      subject,
      html,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
