import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

// Sending address — switch to hello@habanaclub.fi once domain is verified in Resend
const FROM = 'Habana Club <onboarding@resend.dev>'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(t: string) {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

export async function sendTrialConfirmation({
  to,
  firstName,
  style,
  date,
  startTime,
  location,
  instructor,
}: {
  to: string
  firstName: string
  style: 'salsa' | 'bachata'
  date: string
  startTime: string
  location: string
  instructor: string
}) {
  const styleName = style === 'salsa' ? 'Cuban Salsa' : 'Bachata'
  const dateDisplay = formatDate(date)
  const timeDisplay = formatTime(startTime)

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0805;font-family:sans-serif;color:#f5f0e8">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0805;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="text-align:center;padding-bottom:32px">
          <div style="font-size:22px;font-weight:900;color:#c8932a;letter-spacing:0.15em">HABANA CLUB</div>
          <div style="font-size:11px;color:#9a8a72;letter-spacing:0.2em;text-transform:uppercase;margin-top:4px">Dance Studio</div>
        </td></tr>

        <!-- Hero -->
        <tr><td style="background:#141008;border:1px solid #2a1f10;border-radius:16px;padding:40px 32px;text-align:center;margin-bottom:24px">
          <div style="font-size:40px;margin-bottom:12px">🎉</div>
          <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#f5f0e8">You're In, ${firstName}!</h1>
          <p style="margin:0;color:#9a8a72;font-size:16px">Your spot in the ${styleName} trial class is confirmed.</p>
        </td></tr>

        <tr><td style="height:20px"></td></tr>

        <!-- Class details -->
        <tr><td style="background:#141008;border:1px solid #2a1f10;border-radius:16px;padding:28px 32px">
          <div style="font-size:11px;color:#c8932a;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:16px">Class Details</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#9a8a72;font-size:14px;padding:6px 0;width:100px">Class</td>
              <td style="color:#f5f0e8;font-size:14px;font-weight:600;padding:6px 0">${styleName} Trial Class</td>
            </tr>
            <tr>
              <td style="color:#9a8a72;font-size:14px;padding:6px 0">Date</td>
              <td style="color:#f5f0e8;font-size:14px;font-weight:600;padding:6px 0">${dateDisplay}</td>
            </tr>
            <tr>
              <td style="color:#9a8a72;font-size:14px;padding:6px 0">Time</td>
              <td style="color:#f5f0e8;font-size:14px;font-weight:600;padding:6px 0">${timeDisplay} · 90 minutes</td>
            </tr>
            <tr>
              <td style="color:#9a8a72;font-size:14px;padding:6px 0">Location</td>
              <td style="color:#f5f0e8;font-size:14px;font-weight:600;padding:6px 0">${location}</td>
            </tr>
            <tr>
              <td style="color:#9a8a72;font-size:14px;padding:6px 0">Instructor</td>
              <td style="color:#f5f0e8;font-size:14px;font-weight:600;padding:6px 0">${instructor}</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="height:20px"></td></tr>

        <!-- Before you come -->
        <tr><td style="background:#141008;border:1px solid #2a1f10;border-radius:16px;padding:28px 32px">
          <div style="font-size:11px;color:#c8932a;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:16px">Before You Come</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="color:#9a8a72;font-size:14px;padding:5px 0">✓ &nbsp;Arrive <strong style="color:#f5f0e8">10 minutes early</strong></td></tr>
            <tr><td style="color:#9a8a72;font-size:14px;padding:5px 0">✓ &nbsp;Wear <strong style="color:#f5f0e8">comfortable clothes and indoor shoes</strong></td></tr>
            <tr><td style="color:#9a8a72;font-size:14px;padding:5px 0">✓ &nbsp;No partner or experience needed — just show up</td></tr>
            <tr><td style="color:#9a8a72;font-size:14px;padding:5px 0">✓ &nbsp;Pay <strong style="color:#f5f0e8">€10 cash or card on site</strong> after the class</td></tr>
          </table>
        </td></tr>

        <tr><td style="height:20px"></td></tr>

        <!-- Offer -->
        <tr><td style="background:#c8932a;border-radius:16px;padding:24px 32px;text-align:center">
          <div style="font-size:15px;font-weight:700;color:#0a0805;margin-bottom:4px">Loved it? Join a plan and the trial class is on us.</div>
          <div style="font-size:13px;color:#0a0805;opacity:0.75">No commitment needed — just let us know after class.</div>
        </td></tr>

        <tr><td style="height:32px"></td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;color:#4a3a28;font-size:12px">
          <div>Habana Club Dance Studio</div>
          <div style="margin-top:4px">Questions? Reply to this email or find us at habanaclub.fi</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `You're confirmed: ${styleName} trial class on ${dateDisplay}`,
    html,
  })
}
