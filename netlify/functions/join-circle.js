import crypto from "crypto";
import { neon } from "@neondatabase/serverless";
import { sendCirclePassEmail } from "./PromoEmailComponent.js";
import { createSmartPassLink } from "./passkitSmartPassLink.js";

const PASSKIT_DISTRIBUTION_URL = process.env.PASSKIT_DISTRIBUTION_URL;
const PASSKIT_SMARTPASS_KEY = process.env.PASSKIT_SMARTPASS_KEY;
const PASS_EXTERNAL_BASE_URL = "https://pass.ahangama.com";
const CIRCLE_PASS_VALID_DAYS = Number(
  process.env.CIRCLE_PASS_VALID_DAYS || 365,
);

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function generatePassCode(seed, length = 12) {
  return crypto
    .createHash("sha256")
    .update(seed)
    .digest("hex")
    .slice(0, length);
}

function formatColomboYmd(date) {
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const local = new Date(date.getTime() + offsetMs);
  const pad = (value) => String(value).padStart(2, "0");
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
}

function addUtcDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function createCircleSmartPassLink({
  name,
  email,
  mobile,
  venueName,
  perksPrivileges,
  passkitPassId,
  validUntil,
}) {
  const passInfo = [
    venueName ? `Venue: ${venueName}` : null,
    perksPrivileges ? `Perks: ${perksPrivileges}` : null,
    "Complimentary Ahangama Circle pass.",
  ]
    .filter(Boolean)
    .join(" ");

  return createSmartPassLink({
    distributionUrl: PASSKIT_DISTRIBUTION_URL,
    encryptionKey: PASSKIT_SMARTPASS_KEY,
    fields: {
      "members.program.name": "Ahangama Circle",
      "members.member.points": "0",
      "members.member.status": "ACTIVE",
      "members.member.externalId": `${PASS_EXTERNAL_BASE_URL}/cv?id=${passkitPassId}`,
      "person.displayName": name || "Ahangama Circle Member",
      "person.surname": "",
      "person.emailAddress": email || "",
      "person.mobileNumber": mobile || "",
      "meta.venue": venueName || "-",
      "universal.info": passInfo,
      "universal.expiryDate": formatColomboYmd(validUntil),
    },
  });
}

export default async (req) => {
  try {
    if (req.method !== "POST") {
      return json(405, { error: "Method not allowed" });
    }

    const body = await req.json();
    const name = normalizeText(body.name);
    const email = normalizeText(body.email).toLowerCase();
    const mobile = normalizeText(body.mobile);
    const memberType = normalizeText(body.memberType || "owner");
    const venueName = normalizeText(body.venueName);
    const perksPrivileges = normalizeText(body.perksPrivileges);

    if (!name || !email || !mobile || !memberType) {
      return json(400, { error: "Missing required fields" });
    }

    if (memberType === "owner" && !venueName) {
      return json(400, { error: "Venue name is required for owners" });
    }

    if (memberType === "owner" && !perksPrivileges) {
      return json(400, {
        error: "Perks & Privileges is required for owners",
      });
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const now = new Date();
    const validUntil = addUtcDays(now, CIRCLE_PASS_VALID_DAYS);
    const passkitPassId = generatePassCode(`circle:${email}`);
    const smartLinkUrl = await createCircleSmartPassLink({
      name,
      email,
      mobile,
      venueName,
      perksPrivileges,
      passkitPassId,
      validUntil,
    });

    if (!smartLinkUrl) {
      return json(500, { error: "Failed to create Circle pass link" });
    }

    const [record] = await sql`
      INSERT INTO "circle" (
        name,
        email,
        mobile,
        member_type,
        venue_name,
        perks_privileges,
        pass_type,
        pass_status,
        passkit_pass_id,
        smart_link_url,
        valid_from,
        valid_until,
        created_at,
        updated_at
      ) VALUES (
        ${name},
        ${email},
        ${mobile},
        ${memberType},
        ${venueName || null},
        ${perksPrivileges || null},
        ${"complimentary"},
        ${"active"},
        ${passkitPassId},
        ${smartLinkUrl},
        ${now.toISOString()},
        ${validUntil.toISOString()},
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        mobile = EXCLUDED.mobile,
        member_type = EXCLUDED.member_type,
        venue_name = EXCLUDED.venue_name,
        perks_privileges = EXCLUDED.perks_privileges,
        pass_type = EXCLUDED.pass_type,
        pass_status = EXCLUDED.pass_status,
        passkit_pass_id = COALESCE("circle".passkit_pass_id, EXCLUDED.passkit_pass_id),
        smart_link_url = EXCLUDED.smart_link_url,
        valid_until = EXCLUDED.valid_until,
        updated_at = NOW()
      RETURNING *
    `;

    await sendCirclePassEmail({
      customerEmail: record.email,
      passHolderName: record.name,
      smartLinkUrl: record.smart_link_url,
      passkitPassId: record.passkit_pass_id,
      venueName: record.venue_name,
      validUntil: record.valid_until,
    });

    await sql`
      UPDATE "circle"
      SET email_sent_at = NOW(), updated_at = NOW()
      WHERE id = ${record.id}
    `;

    return json(200, {
      ok: true,
      passkit_pass_id: record.passkit_pass_id,
      smart_link_url: record.smart_link_url,
      valid_until: record.valid_until,
    });
  } catch (error) {
    console.error("join-circle error:", error);
    return json(500, {
      error: error.message || "Failed to create Circle pass",
    });
  }
};
