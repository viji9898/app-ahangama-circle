import React from "react";
import "./CirclePerks.css";

const PERKS_META = {
  title: "Ahangama Circle Member Perks",
  description:
    "Explore Ahangama Circle member perks, discounts, and privileges from participating venues across Ahangama and the south coast.",
  url: "https://circle.ahangama.com/perks",
  image:
    "https://customer-apps-techhq.s3.eu-west-2.amazonaws.com/app-ahangama-demo/circle-member-perks.jpg",
};

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
}

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

        <div className="circle-perks-card__perk">{perkText}</div>

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
    document.title = PERKS_META.title;

    setMeta('meta[name="description"]', {
      name: "description",
      content: PERKS_META.description,
    });
    setMeta('meta[property="og:title"]', {
      property: "og:title",
      content: PERKS_META.title,
    });
    setMeta('meta[property="og:description"]', {
      property: "og:description",
      content: PERKS_META.description,
    });
    setMeta('meta[property="og:url"]', {
      property: "og:url",
      content: PERKS_META.url,
    });
    setMeta('meta[property="og:image"]', {
      property: "og:image",
      content: PERKS_META.image,
    });
    setMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: PERKS_META.title,
    });
    setMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: PERKS_META.description,
    });
    setMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: PERKS_META.image,
    });
  }, []);

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
          <h1 className="circle-perks-hero__title">Member Perks</h1>
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