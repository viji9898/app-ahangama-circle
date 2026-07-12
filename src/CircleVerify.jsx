import React, { useEffect, useState } from "react";

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

    fetch(`/.netlify/functions/verify-circle-pass?id=${encodeURIComponent(passId)}`)
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

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "url('/background.jpg') center center / cover no-repeat fixed, #f7f3ef",
        fontFamily: "Inter, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 2px 16px #0001",
          padding: "2em 1.25em 1.5em 1.25em",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: 0, fontWeight: 700, color: "#8B4513" }}>
          Verify Circle Pass
        </h2>
        {loading && (
          <div style={{ color: "#8B4513", fontWeight: 600, marginTop: 16 }}>
            Checking...
          </div>
        )}
        {error && (
          <div style={{ color: "#e74c3c", fontWeight: 600, marginTop: 16 }}>
            {error}
          </div>
        )}
        {status && (
          <>
            <div
              style={{
                color: renderStatusColor(),
                fontWeight: 700,
                fontSize: 22,
                margin: "1em 0",
              }}
            >
              {renderStatusMessage()}
            </div>
            <div style={{ color: "#6d4c2b", fontSize: 15, lineHeight: 1.6 }}>
              <div>Pass Status: {status.pass_status}</div>
              <div>Pass Type: {status.pass_type}</div>
              <div>Venue: {status.venue_name || "-"}</div>
              <div>
                Valid Until:{" "}
                {status.valid_until
                  ? new Date(status.valid_until).toLocaleDateString()
                  : "-"}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}