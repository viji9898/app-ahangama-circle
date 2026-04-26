import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMemberType(memberType) {
  const memberTypeMap = {
    owner: "Owner",
    creative: "Creative",
    founder: "Founder",
    other: "Other",
  };

  return memberTypeMap[memberType] || "Other";
}

export default async (req) => {
  try {
    if (req.method !== "POST") {
      return json(405, { error: "Method not allowed" });
    }

    const { name, email, mobile, memberType, venueName } = await req.json();

    if (!name || !email || !mobile || !memberType) {
      return json(400, { error: "Missing required fields" });
    }

    if (memberType === "owner" && !venueName) {
      return json(400, { error: "Venue name is required for owners" });
    }

    const formattedMemberType = formatMemberType(memberType);
    const escapedName = escapeHtml(name);
    const escapedEmail = escapeHtml(email);
    const escapedMobile = escapeHtml(mobile);
    const escapedVenueName = venueName ? escapeHtml(venueName) : "-";

    await sgMail.send({
      to: "team@ahangama.com",
      from: "hello@ahangama.com",
      replyTo: email,
      subject: `Ahangama Circle request access: ${formattedMemberType}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
          </head>
          <body>
            <div>
              <h1>New Ahangama Circle request access</h1>
              <p><strong>Name:</strong> ${escapedName}</p>
              <p><strong>Email:</strong> ${escapedEmail}</p>
              <p><strong>Mobile:</strong> ${escapedMobile}</p>
              <p><strong>Member type:</strong> ${formattedMemberType}</p>
              <p><strong>Venue name:</strong> ${escapedVenueName}</p>
            </div>
          </body>
        </html>
      `,
      text: [
        "New Ahangama Circle request access",
        `Name: ${name}`,
        `Email: ${email}`,
        `Mobile: ${mobile}`,
        `Member type: ${formattedMemberType}`,
        `Venue name: ${venueName || "-"}`,
      ].join("\n"),
    });

    return json(200, { ok: true });
  } catch (error) {
    console.error("request-access error:", error);
    return json(500, { error: "Failed to send request access email" });
  }
};
