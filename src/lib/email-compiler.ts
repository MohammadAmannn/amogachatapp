export interface EmailTemplate {
  id?: string
  name: string
  subject: string
  headerLogo?: string
  headerText?: string
  bodyContent: string
  buttonText?: string
  buttonUrl?: string
  footerText?: string
  primaryColor?: string
  bgColor?: string
  textColor?: string
}

export function compileEmailHtml(template: EmailTemplate, variables: Record<string, string> = {}): string {
  const primary = template.primaryColor || '#4f46e5'
  const bg = template.bgColor || '#f9fafb'
  const text = template.textColor || '#1f2937'
  
  // Replace variables in body content and subject/header
  let body = template.bodyContent || ''
  Object.entries(variables).forEach(([key, val]) => {
    body = body.replace(new RegExp(`{{${key}}}`, 'g'), val)
  })

  // Format line breaks in body to HTML paragraphs/breaks
  const formattedBody = body
    .split('\n\n')
    .map(para => `<p style="margin: 0 0 16px 0; line-height: 1.6; font-size: 16px; color: ${text};">${para.replace(/\n/g, '<br />')}</p>`)
    .join('')

  const buttonHtml = template.buttonText && template.buttonUrl
    ? `
    <tr>
      <td align="center" style="padding: 24px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" bgcolor="${primary}" style="border-radius: 6px;">
              <a href="${template.buttonUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px; border: 1px solid ${primary};">
                ${template.buttonText}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    : ''

  const logoHtml = template.headerLogo
    ? `<img src="${template.headerLogo}" alt="Logo" style="max-height: 50px; display: block; margin: 0 auto 16px auto;" />`
    : ''

  const headerHtml = (template.headerText || logoHtml)
    ? `
    <tr>
      <td align="center" style="padding: 32px 24px 20px 24px; border-bottom: 1px solid #f0f0f0;">
        ${logoHtml}
        ${template.headerText ? `<h1 style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: bold; color: ${text};">${template.headerText}</h1>` : ''}
      </td>
    </tr>`
    : ''

  const footerHtml = template.footerText
    ? `
    <tr>
      <td align="center" style="padding: 32px 24px; background-color: #f3f4f6; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center;">
          ${template.footerText.replace(/\n/g, '<br />')}
        </p>
      </td>
    </tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject || 'Notification'}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      height: 100% !important;
      background-color: ${bg};
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100% !important; background-color: ${bg}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${bg}; padding: 40px 0;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          ${headerHtml}
          <tr>
            <td style="padding: 32px 24px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              ${formattedBody}
            </td>
          </tr>
          ${buttonHtml}
          ${footerHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
