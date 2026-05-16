// EmailService - Digital product delivery via Resend API
export class EmailService {
  constructor(apiKey, fromEmail, siteUrl) {
    this.apiKey = apiKey
    this.fromEmail = fromEmail || 'noreply@scsc.qzz.io'
    this.siteUrl = siteUrl || 'https://scsc.qzz.io'
  }

  async sendDownloadEmail(toEmail, customerName, products, orderId) {
    const subject = 'Your Digital Products Are Ready!'
    const lines = products.map(p => '<li><a href="' + this.siteUrl + '/api/download/' + p.token + '">' + p.productName + '</a> (expires in 24 hours)</li>').join('')
    const html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><h2>Thank you for your purchase!</h2><p>Hi ' + (customerName || 'there') + '</p><p>Your digital products are ready for download:</p><ul>' + lines + '</ul><p><strong>Important:</strong> Download links expire in 24 hours.</p><p>Order ID: ' + orderId + '</p></div>'
    const text = 'Thank you for your purchase!\n\nDownload: ' + products.map(p => this.siteUrl + '/api/download/' + p.token).join('\\n') + '\n\nLinks expire in 24 hours.\\nOrder ID: ' + orderId
    return this._sendEmail(toEmail, subject, html, text)
  }

  async sendOrderConfirmation(toEmail, customerName, orderId, total, lineItems = []) {
    const subject = 'Order Confirmation - OpenShop'
    const totalCents = typeof total === 'number' ? total : 0
    const totalDisplay = '$' + (totalCents / 100).toFixed(2)

    const itemRows = lineItems.map(item => {
      const itemTotal = typeof item.amount === 'number' ? '$' + (item.amount / 100).toFixed(2) : ''
      return '<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">' + item.name + '</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">' + itemTotal + '</td></tr>'
    }).join('')

    const html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">' +
      '<h2 style="color:#1e293b;">Order Confirmation</h2>' +
      '<p>Hi ' + (customerName || 'there') + ',</p>' +
      '<p>Thank you for your purchase! Here is your order summary:</p>' +
      '<table style="width:100%;border-collapse:collapse;margin:20px 0;">' +
      '<thead><tr style="border-bottom:2px solid #e2e8f0;"><th style="text-align:left;padding:8px 0;color:#64748b;">Item</th><th style="text-align:right;padding:8px 0;color:#64748b;">Amount</th></tr></thead>' +
      '<tbody>' + itemRows + '</tbody>' +
      '<tfoot><tr><td style="padding:12px 0;font-weight:bold;">Total</td><td style="padding:12px 0;font-weight:bold;text-align:right;">' + totalDisplay + '</td></tr></tfoot>' +
      '</table>' +
      '<p style="color:#64748b;font-size:14px;">Order ID: ' + orderId + '</p>' +
      '<p style="color:#64748b;font-size:14px;">If you have any questions, reply to this email.</p>' +
      '</div>'

    const textLines = lineItems.map(item => {
      const itemTotal = typeof item.amount === 'number' ? '$' + (item.amount / 100).toFixed(2) : ''
      return '  - ' + item.name + '  ' + itemTotal
    }).join('\n')
    const text = 'Order Confirmation\n\nHi ' + (customerName || 'there') + ',\n\nThank you for your purchase!\n\nOrder Summary:\n' + textLines + '\n\nTotal: ' + totalDisplay + '\n\nOrder ID: ' + orderId + '\n\nIf you have any questions, reply to this email.'

    return this._sendEmail(toEmail, subject, html, text)
  }

  async _sendEmail(to, subject, html, text) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: this.fromEmail, to: [to], subject, html, text })
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error('Resend API error: ' + (err.message || response.statusText))
    }
    return response.json()
  }
}
