import React from "react";
import "./CirclePerks.css";

function buildInstagramUrl(instagram) {
  if (!instagram) return "";
  const normalized = instagram.trim();
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `https://instagram.com/${normalized.replace(/^@/, "")}`;
}

function buildWhatsappUrl(whatsapp) {
  if (!whatsapp) return "";
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return "";
  const international = digits.startsWith("94") ? digits : `94${digits.replace(/^0/, "")}`;
  return `https://wa.me/${international}`;
}

function getPerkText(venue) {
  return venue.circle_perk || venue.card_perk || venue.offer?.[0] || "Circle member benefit available";
}

function VenueCard({ venue }) {
  const instagramUrl = buildInstagramUrl(venue.instagram || "");
  const whatsappUrl = buildWhatsappUrl(venue.whatsapp || "");
  const perkText = getPerkText(venue);

  return (
    <article className="circle-perks-card">
      <div className="circle-perks-card__media">
        {venue.image ? (
          <img src={venue.image} alt="" className="circle-perks-card__image" loading="lazy" />
        ) : (
          <div className="circle-perks-card__image circle-perks-card__image--placeholder" />
        )}
        <div className="circle-perks-card__perk">{perkText}</div>
      </div>

      <div className="circle-perks-card__body">
        <div className="circle-perks-card__header">
          {venue.logo && <img src={venue.logo} alt="" className="circle-perks-card__logo" loading="lazy" />}
          <div>
            <p className="circle-perks-card__meta">
              {[venue.category, venue.area].filter(Boolean).join(" / ")}
            </p>
            <h2 className="circle-perks-card__title">{venue.name}</h2>
          </div>
        </div>

        <p className="circle-perks-card__excerpt">{venue.excerpt || venue.description}</p>

        <dl className="circle-perks-card__details">
          {venue.how_to_claim && (
            <div>
              <dt>Claim</dt>
              <dd>{venue.how_to_claim}</dd>
            </div>
          )}
          {venue.restrictions && (
            <div>
              <dt>Note</dt>
              <dd>{venue.restrictions}</dd>
            </div>
          )}
          {venue.hours && (
            <div>
              <dt>Hours</dt>
              <dd>{venue.hours}</dd>
            </div>
          )}
        </dl>

        <div className="circle-perks-card__actions">
          {venue.map_url && (
            <a href={venue.map_url} target="_blank" rel="noreferrer" className="circle-perks-card__button">
              Map
            </a>
          )}
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noreferrer" className="circle-perks-card__button">
              Instagram
            </a>
          )}
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="circle-perks-card__button circle-perks-card__button--primary">
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function CirclePerks() {
  const [venues, setVenues] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let isActive = true;

    async function loadVenues() {
      try {
        const response = await fetch("/.netlify/functions/circle-venues");
        const data = await response.json();

        if (!isActive) return;

        if (!response.ok || data.error) {
          throw new Error(data.error || "Failed to load Circle venues.");
        }

        setVenues(Array.isArray(data.venues) ? data.venues : []);
      } catch (loadError) {
        if (!isActive) return;
        setError(loadError.message || "Failed to load Circle venues.");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadVenues();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="circle-perks-page">
      <section className="circle-perks-hero">
        <div className="circle-perks-hero__content">
          <p className="circle-perks-hero__eyebrow">Ahangama Circle</p>
          <h1 className="circle-perks-hero__title">Member Perks</h1>
          <p className="circle-perks-hero__intro">
            Offers, discounts, and privileges shared between Circle venues and pass holders.
          </p>
        </div>
      </section>

      <section className="circle-perks-list" aria-live="polite">
        {loading ? (
          <p className="circle-perks-status">Loading Circle perks...</p>
        ) : error ? (
          <p className="circle-perks-status circle-perks-status--error">{error}</p>
        ) : venues.length ? (
          <div className="circle-perks-grid">
            {venues.map((venue) => (
              <VenueCard key={venue.id || venue.slug || venue.name} venue={venue} />
            ))}
          </div>
        ) : (
          <p className="circle-perks-status">Circle perks will appear here soon.</p>
        )}
      </section>
    </main>
  );
}