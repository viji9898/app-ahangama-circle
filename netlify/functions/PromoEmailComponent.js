import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function formatColomboDate(dateValue) {
  if (!dateValue) return "-";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: process.env.PROMO_TIMEZONE || "Asia/Colombo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateValue));
}

function subtractUtcDays(dateValue, days) {
  const date = new Date(dateValue);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

async function sendPromoTrialEmail({
  customerEmail,
  passHolderName,
  smartLinkUrl,
  passkitPassId,
  startDate,
  trialEndAt,
  paidStartAt,
  paidEndAt,
}) {
  const subject = "Your Ahangama Promo Trial Is Active";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <div>
          <h1>Your Promo Trial Is Live</h1>
          <p>Dear ${passHolderName || "Ahangama Pass Guest"},</p>
          <p>Your 5-day promo trial is active and your digital pass is ready to use.</p>
          <p><strong>Trial Starts:</strong> ${formatColomboDate(startDate)}</p>
          <p><strong>Trial Ends:</strong> ${formatColomboDate(subtractUtcDays(trialEndAt, 1))}</p>
          <p><strong>First Charge Date:</strong> ${formatColomboDate(paidStartAt)}</p>
          <p><strong>Paid Access Until:</strong> ${formatColomboDate(paidEndAt)}</p>
          <p><strong>Promo Pass ID:</strong> ${passkitPassId || "-"}</p>
          <p><a href="${smartLinkUrl}">Open Promo Pass</a></p>
        </div>
      </body>
    </html>
  `;

  await sgMail.send({
    to: customerEmail,
    from: "hello@ahangama.com",
    subject,
    html,
  });
}

async function sendPromoPaidEmail({
  customerEmail,
  passHolderName,
  smartLinkUrl,
  passkitPassId,
  paidStartAt,
  paidEndAt,
  receiptUrl,
}) {
  const subject = "Your Ahangama Promo Payment Was Successful";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <div>
          <h1>Your Promo Payment Was Successful</h1>
          <p>Dear ${passHolderName || "Ahangama Pass Guest"},</p>
          <p>Your promo payment has been collected successfully.</p>
          <p><strong>Paid Access Starts:</strong> ${formatColomboDate(paidStartAt)}</p>
          <p><strong>Paid Access Ends:</strong> ${formatColomboDate(paidEndAt)}</p>
          <p><strong>Promo Pass ID:</strong> ${passkitPassId || "-"}</p>
          <p><a href="${smartLinkUrl}">Open Promo Pass</a></p>
          ${receiptUrl ? `<p><a href="${receiptUrl}">View Receipt</a></p>` : ""}
        </div>
      </body>
    </html>
  `;

  await sgMail.send({
    to: customerEmail,
    from: "hello@ahangama.com",
    subject,
    html,
  });
}

export { sendPromoTrialEmail, sendPromoPaidEmail };