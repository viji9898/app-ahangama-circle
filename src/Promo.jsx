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

function trackGaEvent(eventName, parameters) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, parameters);
}

export default function Promo() {
  const inquiryUrl = "#join-circle";
  const heroAssets = {
    heroPassImage: "/assets/hero_pass_apple_wallet.png",
  };
  const [error, setError] = React.useState("");
  const [successLoading, setSuccessLoading] = React.useState(false);
  const [promoStatus, setPromoStatus] = React.useState(null);
  const [requestAccessState, setRequestAccessState] = React.useState({
    name: "",
    email: "",
    mobile: "",
    memberType: "owner",
    venueName: "",
  });
  const [requestAccessError, setRequestAccessError] = React.useState("");
  const [requestAccessSuccess, setRequestAccessSuccess] = React.useState("");
  const [requestAccessSubmitting, setRequestAccessSubmitting] =
    React.useState(false);
  const partnerVenues = [];

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

  const isOwnerRequest = requestAccessState.memberType === "owner";

  const handleRequestAccessClick = (placement) => {
    trackGaEvent("request_access_click", {
      event_category: "engagement",
      event_label: placement,
      link_target: "join_circle_form",
      cta_text: "Request access",
      placement,
    });
  };

  const handleRequestAccessChange = (event) => {
    const { name, value } = event.target;

    setRequestAccessState((currentState) => ({
      ...currentState,
      [name]: value,
      ...(name === "memberType" && value !== "owner" ? { venueName: "" } : {}),
    }));
  };

  const handleRequestAccessSubmit = async (event) => {
    event.preventDefault();

    setRequestAccessError("");
    setRequestAccessSuccess("");

    if (
      !requestAccessState.name ||
      !requestAccessState.email ||
      !requestAccessState.mobile ||
      !requestAccessState.memberType
    ) {
      setRequestAccessError("Please complete all required fields.");
      return;
    }

    if (isOwnerRequest && !requestAccessState.venueName.trim()) {
      setRequestAccessError(
        "Please add the venue name for owner applications.",
      );
      return;
    }

    setRequestAccessSubmitting(true);

    try {
      const response = await fetch("/.netlify/functions/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: requestAccessState.name.trim(),
          email: requestAccessState.email.trim(),
          mobile: requestAccessState.mobile.trim(),
          memberType: requestAccessState.memberType,
          venueName: requestAccessState.venueName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to send request.");
      }

      trackGaEvent("request_access_form_submit", {
        event_category: "lead",
        event_label: requestAccessState.memberType,
        form_name: "join_circle_request_access",
        member_type: requestAccessState.memberType,
        has_venue_name:
          isOwnerRequest && Boolean(requestAccessState.venueName.trim()),
      });

      setRequestAccessSuccess(
        "Request received. The concierge team will be in touch.",
      );
      setRequestAccessState({
        name: "",
        email: "",
        mobile: "",
        memberType: "owner",
        venueName: "",
      });
    } catch (submitError) {
      setRequestAccessError(
        submitError.message || "Failed to send request. Please try again.",
      );
    } finally {
      setRequestAccessSubmitting(false);
    }
  };

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
              onRequestAccessClick={() => handleRequestAccessClick("hero")}
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
                <h2 className="circle-membership__price">$350 / year</h2>
                <p className="circle-section__body circle-section__body--membership">
                  Founding Members — limited
                  <br />A small number will be invited to join with a
                  complimentary first year
                </p>
                <p className="circle-section__subtle circle-section__subtle--membership">
                  Members receive preferred access and pricing across the Circle
                </p>
                <p className="circle-section__subtle">By inquiry only</p>
                <a
                  href={inquiryUrl}
                  className="circle-cta circle-cta--primary"
                  onClick={() => handleRequestAccessClick("membership")}
                >
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
              <div
                id="join-circle"
                className="circle-section__inner circle-section__inner--centered circle-final-cta"
              >
                <p className="circle-section__eyebrow">Ahangama Circle</p>
                <h2 className="circle-section__title">Join the Circle</h2>
                <p className="circle-section__subtle">
                  For those building, creating, and calling Ahangama home
                </p>
                <form
                  className="circle-form"
                  onSubmit={handleRequestAccessSubmit}
                >
                  <div className="circle-form__grid">
                    <label className="circle-form__field">
                      <span className="circle-form__label">Name</span>
                      <input
                        className="circle-form__input"
                        type="text"
                        name="name"
                        value={requestAccessState.name}
                        onChange={handleRequestAccessChange}
                        autoComplete="name"
                        required
                      />
                    </label>
                    <label className="circle-form__field">
                      <span className="circle-form__label">Email</span>
                      <input
                        className="circle-form__input"
                        type="email"
                        name="email"
                        value={requestAccessState.email}
                        onChange={handleRequestAccessChange}
                        autoComplete="email"
                        required
                      />
                    </label>
                    <label className="circle-form__field">
                      <span className="circle-form__label">Mobile</span>
                      <input
                        className="circle-form__input"
                        type="tel"
                        name="mobile"
                        value={requestAccessState.mobile}
                        onChange={handleRequestAccessChange}
                        autoComplete="tel"
                        required
                      />
                    </label>
                    <label className="circle-form__field">
                      <span className="circle-form__label">I am</span>
                      <select
                        className="circle-form__input circle-form__input--select"
                        name="memberType"
                        value={requestAccessState.memberType}
                        onChange={handleRequestAccessChange}
                        required
                      >
                        <option value="owner">Owner</option>
                        <option value="creative">Creative</option>
                        <option value="founder">Founder</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                    {isOwnerRequest && (
                      <label className="circle-form__field circle-form__field--full">
                        <span className="circle-form__label">Venue name</span>
                        <input
                          className="circle-form__input"
                          type="text"
                          name="venueName"
                          value={requestAccessState.venueName}
                          onChange={handleRequestAccessChange}
                          autoComplete="organization"
                          required={isOwnerRequest}
                        />
                      </label>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="circle-cta circle-cta--inverted circle-form__submit"
                    disabled={requestAccessSubmitting}
                  >
                    {requestAccessSubmitting ? "Sending..." : "Request access"}
                  </button>
                  {requestAccessError && (
                    <p className="circle-form__status circle-form__status--error">
                      {requestAccessError}
                    </p>
                  )}
                  {requestAccessSuccess && (
                    <p className="circle-form__status circle-form__status--success">
                      {requestAccessSuccess}
                    </p>
                  )}
                </form>
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
