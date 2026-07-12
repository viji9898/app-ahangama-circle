import React, { useEffect, useState } from "react";
import "./Promo.css";

export default function CircleVerify() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const passId = params.get("id");

    if (!passId) {
      setError("No Circle pass ID provided.");
      setLoading(false);
      return;
    }

    fetch(
      `/.netlify/functions/verify-circle-pass?id=${encodeURIComponent(passId)}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStatus(data);
      })
      .catch(() => setError("Failed to verify Circle pass."))
      .finally(() => setLoading(false));
  }, []);

  function renderStatusMessage() {
    if (!status) return null;
    if (status.valid) return "Circle Pass is Valid";
    return "Circle Pass is Not Active";
  }

  function renderStatusColor() {
    if (!status) return "#8B4513";
    if (status.valid) return "#28a745";
    return "#e74c3c";
  }

  function shouldShowVenue(venueName) {
    const normalizedVenueName = String(venueName || "").trim();
    return normalizedVenueName && normalizedVenueName !== "-";
  }

  return (
    <div className="promo-page circle-verify-page">
      <div className="promo-page__background" />
      <main className="promo-page__content promo-page__content--success circle-verify-page__content">
        <section className="circle-verify-card">
          <p className="circle-section__eyebrow">Ahangama Circle</p>
          <h1 className="circle-verify-card__title">Verify Circle Pass</h1>
        {loading && (
          <div className="circle-verify-card__loading">
            Checking...
          </div>
        )}
        {error && (
          <div className="circle-verify-card__error">
            {error}
          </div>
        )}
        {status && (
          <>
            <div
              className="circle-verify-card__status"
              style={{ color: renderStatusColor() }}
            >
              {renderStatusMessage()}
            </div>
            <div className="circle-verify-card__details">
              <div className="circle-verify-card__detail circle-verify-card__detail--primary">
                <span>Name</span>
                <strong>{status.name || "Ahangama Circle Member"}</strong>
              </div>
              <div className="circle-verify-card__detail">
                <span>Pass Status</span>
                <strong>{status.pass_status}</strong>
              </div>
              <div className="circle-verify-card__detail">
                <span>Pass Type</span>
                <strong>{status.pass_type}</strong>
              </div>
              {shouldShowVenue(status.venue_name) && (
                <div className="circle-verify-card__detail">
                  <span>Venue</span>
                  <strong>{status.venue_name}</strong>
                </div>
              )}
              <div className="circle-verify-card__detail">
                <span>Valid Until</span>
                <strong>
                  {status.valid_until
                    ? new Date(status.valid_until).toLocaleDateString()
                    : "-"}
                </strong>
              </div>
            </div>
          </>
        )}
        </section>
      </main>
    </div>
  );
}
