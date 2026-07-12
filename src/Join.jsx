import React from "react";
import "./Promo.css";

function trackGaEvent(eventName, parameters) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, parameters);
}

export default function Join() {
  const [formState, setFormState] = React.useState({
    name: "",
    email: "",
    mobile: "",
    memberType: "owner",
    venueName: "",
    perksPrivileges: "",
  });
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [smartLinkUrl, setSmartLinkUrl] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const isOwnerRequest = formState.memberType === "owner";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
      ...(name === "memberType" && value !== "owner" ? { venueName: "" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSmartLinkUrl("");

    if (!formState.name || !formState.email || !formState.mobile) {
      setError("Please complete all required fields.");
      return;
    }

    if (isOwnerRequest && !formState.venueName.trim()) {
      setError("Please add the venue name for owner applications.");
      return;
    }

    if (isOwnerRequest && !formState.perksPrivileges.trim()) {
      setError("Please describe the perks and privileges your venue offers.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/.netlify/functions/join-circle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          mobile: formState.mobile.trim(),
          memberType: formState.memberType,
          venueName: formState.venueName.trim(),
          perksPrivileges: formState.perksPrivileges.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to create your Circle pass.");
      }

      trackGaEvent("circle_join_submit", {
        event_category: "lead",
        event_label: formState.memberType,
        form_name: "circle_join",
        member_type: formState.memberType,
        has_venue_name: isOwnerRequest && Boolean(formState.venueName.trim()),
        has_perks_privileges: Boolean(formState.perksPrivileges.trim()),
      });

      setSuccess("Your complimentary Circle pass has been emailed to you.");
      setSmartLinkUrl(data.smart_link_url || "");
      setFormState({
        name: "",
        email: "",
        mobile: "",
        memberType: "owner",
        venueName: "",
        perksPrivileges: "",
      });
    } catch (submitError) {
      setError(
        submitError.message ||
          "Failed to create your Circle pass. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="promo-page">
      <div className="promo-page__background" />
      <main className="promo-page__content promo-page__content--landing join-page">
        <section className="circle-section circle-section--final-cta join-page__section">
          <div className="circle-section__inner circle-section__inner--centered circle-final-cta join-page__panel">
            <p className="circle-section__eyebrow">Ahangama Circle</p>
            <h1 className="circle-section__title">Join the Circle</h1>
            <p className="circle-section__subtle">
              Complimentary access for owners, founders, and creatives
            </p>
            <form className="circle-form" onSubmit={handleSubmit}>
              <div className="circle-form__grid">
                <label className="circle-form__field">
                  <span className="circle-form__label">Name</span>
                  <input
                    className="circle-form__input"
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
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
                    value={formState.email}
                    onChange={handleChange}
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
                    value={formState.mobile}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                  />
                </label>
                <label className="circle-form__field">
                  <span className="circle-form__label">I am</span>
                  <select
                    className="circle-form__input circle-form__input--select"
                    name="memberType"
                    value={formState.memberType}
                    onChange={handleChange}
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
                      value={formState.venueName}
                      onChange={handleChange}
                      autoComplete="organization"
                      required={isOwnerRequest}
                    />
                  </label>
                )}
                <label className="circle-form__field circle-form__field--full">
                  <span className="circle-form__label">Perks & Privileges</span>
                  <textarea
                    className="circle-form__input circle-form__input--textarea"
                    name="perksPrivileges"
                    value={formState.perksPrivileges}
                    onChange={handleChange}
                    placeholder="Describe the benefits, offers, or access your venue gives Circle members."
                    required={isOwnerRequest}
                  />
                </label>
              </div>
              <button
                type="submit"
                className="circle-cta circle-cta--inverted circle-form__submit"
                disabled={submitting}
              >
                {submitting ? "Creating pass..." : "Join and get pass"}
              </button>
              {error && (
                <p className="circle-form__status circle-form__status--error">
                  {error}
                </p>
              )}
              {success && (
                <p className="circle-form__status circle-form__status--success">
                  {success}
                </p>
              )}
              {smartLinkUrl && (
                <a
                  className="circle-cta circle-cta--primary join-page__wallet-link"
                  href={smartLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Add to wallet
                </a>
              )}
            </form>
            <p className="circle-cta__microcopy">
              Your pass link works for Apple Wallet and Android wallet options
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
