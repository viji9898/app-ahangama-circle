import { neon } from "@neondatabase/serverless";

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

function normalizeOffer(offer) {
  if (Array.isArray(offer)) return offer.filter(Boolean).map(String);
  if (typeof offer === "string" && offer.trim()) return [offer.trim()];
  return [];
}

function mapVenue(venue) {
  return {
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    category: venue.category,
    area: venue.area,
    excerpt: venue.excerpt,
    description: venue.description,
    image: venue.image,
    logo: venue.logo,
    circle_perk: venue.circle_perk,
    card_perk: venue.card_perk,
    offer: normalizeOffer(venue.offer),
    how_to_claim: venue.how_to_claim,
    restrictions: venue.restrictions,
    hours: venue.hours,
    map_url: venue.map_url,
    whatsapp: venue.whatsapp,
    instagram: venue.instagram,
  };
}

export default async (req) => {
  try {
    if (req.method !== "GET") {
      return json(405, { error: "Method not allowed" });
    }

    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

    if (!databaseUrl) {
      return json(500, { error: "Database URL is not configured" });
    }

    const sql = neon(databaseUrl);
    const venues = await sql`
      SELECT
        id,
        name,
        slug,
        category,
        area,
        excerpt,
        description,
        image,
        logo,
        circle_perk,
        card_perk,
        offer,
        how_to_claim,
        restrictions,
        hours,
        map_url,
        whatsapp,
        instagram
      FROM venues260414
      WHERE circle IS TRUE
        AND deleted_at IS NULL
        AND status = 'active'
        AND live IS TRUE
      ORDER BY
        COALESCE(pass_priority, 0) DESC,
        COALESCE(priority_score, 0) DESC,
        name ASC
    `;

    return json(200, { venues: venues.map(mapVenue) });
  } catch (error) {
    console.error("circle-venues error:", error);
    return json(500, { error: "Failed to load Circle venues" });
  }
};