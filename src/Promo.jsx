import React from "react";
import HomeHeroSection from "./HomeHeroSection.jsx";
import "./Promo.css";

function getTimeZoneDateString(timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

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
  const heroAssets = {
    appleWalletIcon: "/assets/add_to_apple_wallet.png",
    googleWalletIcon: "/assets/add_to_google_wallet.png",
    heroPassImage: "/assets/hero_pass_apple_wallet.png",
  };
  const todayStr = getTimeZoneDateString("Asia/Colombo");
  const maxDateStr = addDaysToYmd(todayStr, 60);
  const [startDate, setStartDate] = React.useState(todayStr);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successLoading, setSuccessLoading] = React.useState(false);
  const [promoStatus, setPromoStatus] = React.useState(null);

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
              appleWalletIcon={heroAssets.appleWalletIcon}
              googleWalletIcon={heroAssets.googleWalletIcon}
              heroPassImage={heroAssets.heroPassImage}
            />
            <div id="how-it-works" className="promo-card promo-card--checkout">
              <img
                src="https://customer-apps-techhq.s3.eu-west-2.amazonaws.com/app-ahangama-demo/ahangama_pass_logo.png"
                alt="Ahangama Pass Logo"
                className="promo-card__logo"
              />
              <h1 className="promo-card__title">Ahangama Circle</h1>
              <p className="promo-card__text">
                15 day pass with a 5 day trial and any time access.
              </p>
              <div className="promo-card__field">
                <label htmlFor="promo-start-date" className="promo-card__label">
                  Start Date:
                </label>
                <input
                  id="promo-start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  min={todayStr}
                  max={maxDateStr}
                  required
                  className="promo-card__input"
                />
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setError("");

                  try {
                    const response = await fetch(
                      "/.netlify/functions/create-promo-checkout-session",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ startDate }),
                      },
                    );
                    const data = await response.json();

                    if (response.ok && data.url) {
                      window.location.href = data.url;
                      return;
                    }

                    setError(data.error || "Unable to start promo checkout.");
                  } catch {
                    setError("Network error. Please try again.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="promo-card__button"
              >
                {loading ? "Redirecting..." : "15 Days Pass"}
                <div className="promo-card__button-subtitle">
                  5 Day Trial • USD 30 • Any Time
                </div>
              </button>
              {error && <div className="promo-card__error">{error}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}