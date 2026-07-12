import { neon } from "@neondatabase/serverless";

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async (req) => {
  const url = new URL(req.url, process.env.SITE_URL || "http://localhost:8889");
  const passId = url.searchParams.get("id");
  if (!passId) return json(400, { error: "Missing pass ID" });

  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const [circlePass] = await sql`
    SELECT
      passkit_pass_id,
      pass_type,
      pass_status,
      name,
      venue_name,
      perks_privileges,
      valid_from,
      valid_until
    FROM "circle"
    WHERE passkit_pass_id = ${passId}
  `;

  if (!circlePass) return json(404, { error: "Not found" });

  const now = new Date();
  const validUntil = circlePass.valid_until
    ? new Date(circlePass.valid_until)
    : null;
  const withinWindow = validUntil ? validUntil >= now : true;
  const valid = circlePass.pass_status === "active" && withinWindow;

  return json(200, {
    valid,
    pass_type: circlePass.pass_type,
    pass_status: circlePass.pass_status,
    name: circlePass.name,
    venue_name: circlePass.venue_name,
    perks_privileges: circlePass.perks_privileges,
    valid_from: circlePass.valid_from,
    valid_until: circlePass.valid_until,
  });
};