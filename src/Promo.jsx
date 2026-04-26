import React from "react";
import HomeHeroSection from "./HomeHeroSection.jsx";
import "./Promo.css";

function addDaysToYmd(ymd, days) {
  const date = new Date(`${ymd}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split("T")[0];
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function subtractUtcDays(dateValue, days) {
  const date = new Date(dateValue);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

export default function Promo() {
  const inquiryUrl =
    "mailto:hello@ahangama.com?subject=Ahangama%20Circle%20Membership%20Inquiry";
  const heroAssets = {
    heroPassImage: "/assets/hero_pass_apple_wallet.png",
  };
  const [error, setError] = React.useState("");
  const [successLoading, setSuccessLoading] = React.useState(false);
  const [promoStatus, setPromoStatus] = React.useState(null);
  const partnerVenues = [
    "The Kip",
    "Cactus",
    "Black Honey",
    "Hotel de Uncles",
    "Kabalana Hotel",
    "Marshmellow Beach",
    "Lamana",
    "Soul & Surf",
  ];

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutState = params.get("checkout");
    const sessionId = params.get("session_id");
    let retryTimeoutId;
    let isActive = true;

    if (checkoutState === "cancelled") {
      setError("Promo checkout was cancelled.");
      return;
    }

    if (checkoutState !== "success" || !sessionId) {
      return () => {
        isActive = false;
        window.clearTimeout(retryTimeoutId);
      };
    }

    setSuccessLoading(true);
    setError("");

    const loadPromoStatus = async (attempt = 0) => {
      try {
        const response = await fetch(
          `/.netlify/functions/promo-status?session_id=${encodeURIComponent(sessionId)}`,
        );
        const data = await response.json();

        if (!isActive) return;

        if (response.status === 202 && data.pending) {
          if (attempt >= 9) {
            setError(
              "Your promo is still being activated. Please refresh in a moment.",
            );
            setSuccessLoading(false);
            return;
          }

          retryTimeoutId = window.setTimeout(() => {
            loadPromoStatus(attempt + 1);
          }, 1500);
          return;
        }

        if (!response.ok || data.error) {
          setError(data.error || "Failed to load promo status.");
          setSuccessLoading(false);
          return;
        }

        setPromoStatus(data);
        setSuccessLoading(false);
      } catch {
        if (!isActive) return;
        setError("Failed to load promo status.");
        setSuccessLoading(false);
      }
    };

    loadPromoStatus();

    return () => {
      isActive = false;
      window.clearTimeout(retryTimeoutId);
    };
  }, []);

  const isSuccessView = Boolean(promoStatus) || successLoading;

  return (
    <div className="promo-page">
      <div className="promo-page__background" />
      <div
        className={`promo-page__content ${
          isSuccessView
            ? "promo-page__content--success"
            : "promo-page__content--landing"
        }`}
      >
        {isSuccessView ? (
          <div className="promo-card promo-card--success">
            <img
              src="https://customer-apps-techhq.s3.eu-west-2.amazonaws.com/app-ahangama-demo/ahangama_pass_logo.png"
              alt="Ahangama Pass Logo"
              className="promo-card__logo"
            />
            <h1 className="promo-card__title">Promo Trial Activated</h1>
            {successLoading ? (
              <div className="promo-card__loading">
                Loading your promo details...
              </div>
            ) : promoStatus ? (
              <>
                <p className="promo-card__text">
                  Your 5-day trial is active now. Your first paid charge is
                  scheduled for {formatDate(promoStatus.paid_start_at)}.
                </p>
                <ul className="promo-card__list">
                  <li className="promo-card__list-item">
                    <b>Trial Window:</b>
                    <br />
                    {formatDate(promoStatus.trial_start_at)} to{" "}
                    {formatDate(subtractUtcDays(promoStatus.trial_end_at, 1))}
                  </li>
                  <li className="promo-card__list-item">
                    <b>Paid Access:</b>
                    <br />
                    {formatDate(promoStatus.paid_start_at)} to{" "}
                    {formatDate(promoStatus.paid_end_at)}
                  </li>
                  <li className="promo-card__list-item">
                    <b>Billing Status:</b>
                    <br />
                    {promoStatus.billing_status}
                  </li>
                  <li className="promo-card__list-item">
                    <b>Access Status:</b>
                    <br />
                    {promoStatus.access_status}
                  </li>
                  <li className="promo-card__list-item">
                    <b>Promo Pass ID:</b>
                    <br />
                    {promoStatus.passkit_pass_id || "-"}
                  </li>
                </ul>
                <div className="promo-card__actions">
                  {promoStatus.smart_link_url && (
                    <a
                      href={promoStatus.smart_link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="promo-card__link"
                    >
                      Open Promo Pass
                    </a>
                  )}
                </div>
              </>
            ) : null}
            {error && <div className="promo-card__error">{error}</div>}
          </div>
        ) : (
          <div className="promo-page__stack">
            <HomeHeroSection
              heroPassImage={heroAssets.heroPassImage}
              membershipUrl={inquiryUrl}
            />
            <section className="circle-section circle-section--statement">
              <div className="circle-section__inner circle-section__inner--narrow circle-section__inner--centered">
                <p className="circle-section__eyebrow">What this is</p>
                <h2 className="circle-section__title">
                  A private circle in Ahangama
                </h2>
                <p className="circle-section__body">
                  A curated network of owners, founders, and creatives —
                  recognised across the places that matter.
                </p>
                <p className="circle-section__body circle-section__body--supporting">
                  Supported by a private concierge that connects members across
                  the Circle.
                </p>
                <p className="circle-section__subtle">
                  Not public. Not for everyone.
                </p>
              </div>
            </section>

            <section
              id="how-it-works"
              className="circle-section circle-section--steps"
            >
              <div className="circle-section__inner">
                <p className="circle-section__eyebrow">How it works</p>
                <div className="circle-steps">
                  <article className="circle-step">
                    <span className="circle-step__number">01 — Apply</span>
                    <h3 className="circle-step__title">Apply</h3>
                    <p className="circle-step__text">Request access</p>
                  </article>
                  <article className="circle-step">
                    <span className="circle-step__number">02 — Recognised</span>
                    <h3 className="circle-step__title">Recognised</h3>
                    <p className="circle-step__text">Across partner venues</p>
                  </article>
                  <article className="circle-step">
                    <span className="circle-step__number">03 — Enjoy</span>
                    <h3 className="circle-step__title">Enjoy</h3>
                    <p className="circle-step__text">
                      Benefits, coordination, and community
                    </p>
                  </article>
                </div>
              </div>
            </section>

            <section className="circle-section circle-section--concierge-strip">
              <div className="circle-section__inner">
                <div
                  className="circle-strip"
                  aria-label="Circle access details"
                >
                  <article className="circle-strip__item">
                    <h3 className="circle-strip__title">Private concierge</h3>
                    <p className="circle-strip__text">
                      Coordinated access across the Circle
                    </p>
                  </article>
                  <article className="circle-strip__item">
                    <h3 className="circle-strip__title">
                      Preferred member pricing
                    </h3>
                    <p className="circle-strip__text">
                      Available across selected services
                    </p>
                  </article>
                  <article className="circle-strip__item">
                    <h3 className="circle-strip__title">Introductions</h3>
                    <p className="circle-strip__text">
                      Connect with owners and creatives
                    </p>
                  </article>
                </div>
              </div>
            </section>

            <section className="circle-section circle-section--venues">
              <div className="circle-section__inner">
                <p className="circle-section__eyebrow">Recognised across</p>
                <h2 className="circle-section__title">
                  Recognised across Ahangama
                </h2>
                <p className="circle-section__subtle">Selected places</p>
                <div className="circle-venues" aria-label="Selected partners">
                  {partnerVenues.map((venue) => (
                    <span key={venue} className="circle-venues__item">
                      {venue}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section
              id="membership"
              className="circle-section circle-section--membership"
            >
              <div className="circle-section__inner circle-section__inner--centered">
                <p className="circle-section__eyebrow">Membership</p>
                <h2 className="circle-section__title">Membership</h2>
                <h2 className="circle-membership__price">$250 / year</h2>
                <p className="circle-section__body circle-section__body--membership">
                  Founding Members — limited
                  <br />A small number will be invited to join with a
                  complimentary first year
                </p>
                <p className="circle-section__subtle circle-section__subtle--membership">
                  Members receive preferred access and pricing across the Circle
                </p>
                <p className="circle-section__subtle">By inquiry only</p>
                <a href={inquiryUrl} className="circle-cta circle-cta--primary">
                  Request access
                </a>
                <p className="circle-cta__microcopy">
                  Handled privately via concierge
                </p>
              </div>
            </section>

            <section
              id="final-cta"
              className="circle-section circle-section--final-cta"
            >
              <div className="circle-section__inner circle-section__inner--centered circle-final-cta">
                <p className="circle-section__eyebrow">Ahangama Circle</p>
                <h2 className="circle-section__title">Join the Circle</h2>
                <p className="circle-section__subtle">
                  For those building, creating, and calling Ahangama home
                </p>
                <a
                  href={inquiryUrl}
                  className="circle-cta circle-cta--inverted"
                >
                  Request access
                </a>
                <p className="circle-cta__microcopy">
                  Handled privately via concierge
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
