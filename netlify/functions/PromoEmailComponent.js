import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = "hello@ahangama.com";
const DEFAULT_SITE_URL = "https://ahangama.com";
const AHANGAMA_GOOGLE_MAP_URL = "https://maps.app.goo.gl/yziABRfTyJhHCwNG7";
const ACCENT = "#ff6f61";
const QUOTE_IMAGE_PATH = "/newsletter-character-quote.png";

const FEATURED_ARTICLES = [
  {
    id: "sunset-article",
    label: "Sunset",
    title: "Where Ahangama Gathers for Sunset",
    path: "/where-ahangama-gathers-for-sunset-stairway-rooftop-bar-at-lighthouse-hotel/?utm_source=circle_pass_email&utm_medium=email&utm_campaign=circle_join&utm_content=sunset_article",
    image:
      "https://customer-apps-techhq.s3.eu-west-2.amazonaws.com/app-ahangama-edits/where-ahangama-gathers-for-sunset+/hero-view-from-the-bar.jpg",
  },
  {
    id: "twelve-things-article",
    label: "Guide",
    title: "12 Things to Do in Ahangama",
    path: "/12-things/?utm_source=circle_pass_email&utm_medium=email&utm_campaign=circle_join&utm_content=12_things_article",
    image:
      "https://hips.hearstapps.com/hmg-prod/images/exploring-ahangama-the-surfing-sweet-spot-on-sri-lanka-s-southern-coast-66475f779dc88.jpg?crop=0.6672958942897593xw:1xh;center,top&resize=640:*",
  },
  {
    id: "coastal-town-article",
    label: "Town Guide",
    title: "Sri Lanka's Most Interesting Coastal Town",
    path: "/sri-lankas-most-interesting-coastal-town/?utm_source=circle_pass_email&utm_medium=email&utm_campaign=circle_join&utm_content=coastal_town_article",
  },
  {
    id: "getting-around-article",
    label: "Transport",
    title: "Getting Around Ahangama",
    path: "/getting-around-ahangama-scooters-tuk-tuks-airport-transfers/?utm_source=circle_pass_email&utm_medium=email&utm_campaign=circle_join&utm_content=getting_around_article",
  },
  {
    id: "living-room-article",
    label: "Design",
    title: "The Living Room Concept Store",
    path: "/the-living-room-concept-store/?utm_source=circle_pass_email&utm_medium=email&utm_campaign=circle_join&utm_content=living_room_article",
  },
];

const WELCOME_EVENTS = [
  {
    date: "Ongoing",
    title: "Daily Happy Hour",
    venue: "Samba",
    time: "5:00 PM - 7:00 PM",
    image: "/assets/Samba%20Haappy%20Hour%20-Bji6FvzF.png",
    instagramUrl:
      "https://www.instagram.com/samba_ahangama?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    directionsUrl: "https://www.google.com/maps/search/?api=1&query=Samba%20Ahangama",
  },
];

const ESSENTIALS = [
  {
    type: "Map",
    name: "Ahangama Map",
    url: AHANGAMA_GOOGLE_MAP_URL,
  },
  {
    type: "Guide",
    name: "Getting Around Ahangama",
    url: "/getting-around-ahangama-scooters-tuk-tuks-airport-transfers/?utm_source=circle_pass_email&utm_medium=email&utm_campaign=circle_join&utm_content=essential_getting_around",
  },
  {
    type: "Dispatch",
    name: "The Ahangama List",
    url: "/newsletter-data?utm_source=circle_pass_email&utm_medium=email&utm_campaign=circle_join&utm_content=online_dispatch",
  },
];

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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isLocalHostname(hostname) {
  const normalized = String(hostname || "").toLowerCase();

  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "0.0.0.0" ||
    normalized.endsWith(".local")
  );
}

function getSiteUrl() {
  const candidates = [
    process.env.GUEST_EMAIL_BASE_URL,
    process.env.EMAIL_PUBLIC_SITE_URL,
    process.env.PUBLIC_SITE_URL,
    process.env.VITE_SITE_URL,
    process.env.SITE_URL,
  ];

  for (const candidate of candidates) {
    const configured = String(candidate || "").trim();

    if (!configured) continue;

    try {
      const url = new URL(configured);

      if (!isLocalHostname(url.hostname)) {
        return url.origin.replace(/\/$/, "");
      }
    } catch {
      // Fall back to the canonical production domain.
    }
  }

  return DEFAULT_SITE_URL;
}

function absoluteUrl(pathOrUrl) {
  if (/^https?:\/\//i.test(String(pathOrUrl || ""))) {
    return pathOrUrl;
  }

  return `${getSiteUrl()}${String(pathOrUrl || "/")}`;
}

function smallLinkHtml(label, href) {
  if (!href) return "";

  return `<a href="${escapeHtml(href)}" style="color:#111;text-decoration:underline;font-weight:700;">${escapeHtml(label)}</a>`;
}

function buildEventHtml(event) {
  const eventImageUrl = event.image ? absoluteUrl(event.image) : null;
  const eventDetailsHtml = `
    <div style="font-family:Arial,sans-serif;font-size:8px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:${ACCENT};margin-bottom:4px;">${escapeHtml(event.date)}</div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.05;font-weight:700;color:#242424;">${escapeHtml(event.title)}</div>
    <div style="font-family:Arial,sans-serif;font-size:10px;line-height:1.45;color:#333;margin-top:5px;">${escapeHtml(event.venue)} &middot; ${escapeHtml(event.time)}</div>
    <div style="font-family:Arial,sans-serif;font-size:10px;line-height:1.6;color:#111;margin-top:7px;">
      ${smallLinkHtml("Instagram", event.instagramUrl)}${event.instagramUrl ? " &nbsp; " : ""}${smallLinkHtml("Map", event.directionsUrl)}
    </div>
  `;

  return `
    <tr>
      <td style="padding:13px 0;border-top:1px solid #242424;">
        ${
          eventImageUrl
            ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="78" style="width:78px;padding:0 12px 0 0;vertical-align:top;">
                    <img src="${escapeHtml(eventImageUrl)}" width="66" height="66" alt="${escapeHtml(event.title)}" style="display:block;width:66px;height:66px;object-fit:cover;border:1px solid #242424;" />
                  </td>
                  <td style="padding:0;vertical-align:top;">
                    ${eventDetailsHtml}
                  </td>
                </tr>
              </table>`
            : eventDetailsHtml
        }
      </td>
    </tr>
  `;
}

function buildArticleHtml(article) {
  return `
    <tr>
      <td style="padding:13px 0;border-top:1px solid #242424;">
        <div style="font-family:Arial,sans-serif;font-size:8px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:${ACCENT};margin-bottom:5px;">${escapeHtml(article.label)}</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.08;font-weight:700;color:#242424;"><a href="${escapeHtml(absoluteUrl(article.path))}" style="color:#111;text-decoration:none;display:block;">${escapeHtml(article.title)}</a></div>
      </td>
    </tr>
  `;
}

function buildArticleCardHtml(article) {
  if (!article.image) return buildArticleHtml(article);

  return `
    <tr>
      <td style="padding:22px 0;border-bottom:1px solid #242424;">
        <a href="${escapeHtml(absoluteUrl(article.path))}" style="display:block;color:#fff;text-decoration:none;">
          <img src="${escapeHtml(article.image)}" width="600" alt="${escapeHtml(article.title)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
          <div style="background:#111;padding:13px 14px 16px;font-family:Georgia,'Times New Roman',serif;font-size:29px;line-height:.95;font-weight:700;color:#fff;">
            ${escapeHtml(article.title)}
          </div>
        </a>
      </td>
    </tr>
  `;
}

function buildEssentialHtml(item) {
  return `
    <tr>
      <td style="padding:10px 0;border-top:1px solid #cfc8bd;">
        <div style="font-family:Arial,sans-serif;font-size:8px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${ACCENT};margin-bottom:4px;">${escapeHtml(item.type)}</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.15;font-weight:700;color:#111;">${escapeHtml(item.name)}</div>
        <div style="font-family:Arial,sans-serif;font-size:10px;margin-top:6px;">${smallLinkHtml("Open", absoluteUrl(item.url))}</div>
      </td>
    </tr>
  `;
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

async function sendCirclePassEmail({
  customerEmail,
  passHolderName,
  smartLinkUrl,
  passkitPassId,
  venueName,
  validUntil,
}) {
  const subject = "Welcome to the Ahangama Circle";
  const safeName = escapeHtml(passHolderName || "Ahangama Circle Member");
  const safeVenueName = escapeHtml(venueName || "-");
  const safeSmartLinkUrl = escapeHtml(smartLinkUrl);
  const safePasskitPassId = escapeHtml(passkitPassId || "-");
  const firstName = escapeHtml(
    String(passHolderName || "there").trim().split(/\s+/)[0] || "there",
  );
  const mapLink = AHANGAMA_GOOGLE_MAP_URL;
  const newsletterLink = absoluteUrl(
    "/newsletter-data?utm_source=circle_pass_email&utm_medium=email&utm_campaign=circle_join&utm_content=online_dispatch",
  );
  const quoteImageUrl = absoluteUrl(QUOTE_IMAGE_PATH);
  const heroArticleCards = FEATURED_ARTICLES.slice(0, 2)
    .map((article) => buildArticleCardHtml(article))
    .join("");
  const html = `
    <div style="margin:0;padding:0;background:#fff;color:#111;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;margin:0;padding:0;">
        <tr>
          <td align="center" style="padding:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;">
              <tr>
                <td style="padding:24px 20px 24px;background:#fff;border-top:2px solid #111;border-bottom:2px solid #111;color:#111;">
                  <div style="font-family:Arial,sans-serif;font-size:9px;line-height:1.2;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${ACCENT};margin:0 0 10px;">Ahangama Circle Pass</div>
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:31px;line-height:.98;font-weight:700;color:#242424;margin:0 0 13px;">
                    Hi ${firstName}, your complimentary Ahangama Circle Pass is ready.
                  </div>
                  <div style="font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#333;margin:0 0 14px;">
                    Use it as your first Ahangama starting point: unlock the pass, then open the map before you head out.
                  </div>
                  <div style="font-family:Arial,sans-serif;font-size:11px;line-height:1.4;font-weight:700;">
                    <a href="${safeSmartLinkUrl}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 13px;background:#111;color:#fff;text-decoration:none;border:1px solid #111;">View My Pass</a>
                    <a href="${escapeHtml(mapLink)}" style="display:inline-block;margin:0 0 8px 0;padding:10px 13px;background:#fff;color:#111;text-decoration:none;border:1px solid #111;">See the Ahangama Map</a>
                  </div>
                  <div style="font-family:Arial,sans-serif;font-size:10px;line-height:1.6;color:#555;margin-top:8px;">
                    Venue: ${safeVenueName} &nbsp;|&nbsp; Valid until: ${escapeHtml(formatColomboDate(validUntil))} &nbsp;|&nbsp; Pass ID: ${safePasskitPassId}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 20px 20px;border-bottom:1px solid #242424;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:88px;vertical-align:middle;padding-right:14px;">
                        <img src="${escapeHtml(quoteImageUrl)}" width="88" alt="Ahangama character" style="display:block;width:88px;height:auto;border:0;" />
                      </td>
                      <td style="vertical-align:middle;font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:1.28;font-weight:700;font-style:italic;color:#242424;">
                        Physically I'm here. Mentally I'm in a pool in Ahangama ordering my third arrack cocktail.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:9px 20px 10px;background:#f3f3f3;border-bottom:2px solid #111;">
                  <div style="font-family:Arial,sans-serif;font-size:12px;line-height:1.55;font-weight:700;color:#111;">
                    <span style="color:${ACCENT};">PASS:</span> Complimentary Circle access<br />
                    <span style="color:${ACCENT};">FEATURED ARTICLES:</span> ${FEATURED_ARTICLES.length} featured articles<br />
                    <span style="color:${ACCENT};">EVENTS:</span> ${WELCOME_EVENTS.length} event
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 20px 8px;">
                  <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:${ACCENT};margin-bottom:6px;">What&rsquo;s On</div>
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:.98;font-weight:700;color:#242424;">This Week</div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">${WELCOME_EVENTS.map((event) => buildEventHtml(event)).join("")}</table>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px 0;">
                  <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:${ACCENT};margin-bottom:6px;">Start Here</div>
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:.98;font-weight:700;color:#242424;">Ahangama Picks</div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">${heroArticleCards}</table>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 20px 0;">
                  <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:${ACCENT};margin-bottom:6px;">Worth Reading</div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${FEATURED_ARTICLES.slice(2).map((article) => buildArticleHtml(article)).join("")}</table>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 20px 26px;">
                  <div style="background:#fff;border-top:2px solid #111;border-bottom:2px solid #111;padding:14px 0 4px;">
                    <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:${ACCENT};margin:0 0 6px;">Essentials</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${ESSENTIALS.map((item) => buildEssentialHtml(item)).join("")}</table>
                  </div>
                  <div style="font-family:Arial,sans-serif;font-size:11px;line-height:1.5;color:#333;margin-top:18px;">${smallLinkHtml("Open the online dispatch", newsletterLink)}</div>
                  <div style="font-family:Arial,sans-serif;font-size:10px;color:#777;margin-top:22px;">Ahangama Pass</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
  const text = [
    `Hi ${passHolderName || "there"}, your complimentary Ahangama Circle Pass is ready.`,
    `View My Pass: ${smartLinkUrl}`,
    `See the Ahangama map: ${mapLink}`,
    `Venue: ${venueName || "-"}`,
    `Valid until: ${formatColomboDate(validUntil)}`,
    `Circle Pass ID: ${passkitPassId || "-"}`,
    "",
    "The Ahangama Minute",
    "Physically I'm here. Mentally I'm in a pool in Ahangama ordering my third arrack cocktail.",
    "",
    "WHAT'S ON",
    ...WELCOME_EVENTS.map(
      (event) =>
        `${event.date}: ${event.title} at ${event.venue} - ${event.time}`,
    ),
    "",
    "WORTH READING",
    ...FEATURED_ARTICLES.map((article) => article.title),
    "",
    `Open the online dispatch: ${newsletterLink}`,
  ].join("\n");

  await sgMail.send({
    to: customerEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text,
  });
}

export { sendCirclePassEmail, sendPromoPaidEmail, sendPromoTrialEmail };
