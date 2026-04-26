import "./HomeHeroSection.css";

export default function HomeHeroSection({
  heroPassImage,
  membershipUrl = "mailto:hello@ahangama.com?subject=Ahangama%20Circle%20Membership%20Inquiry",
  onRequestAccessClick,
}) {
  return (
    <section id="hero" className="new-home-hero" aria-label="Hero">
      <div className="new-home-hero__shell">
        <div className="new-home-hero__row">
          <div className="new-home-hero__copy-column">
            <div className="new-home-hero__copy">
              <span className="new-home-hero__eyebrow">Ahangama Circle</span>

              <h1 className="new-home-hero__title">The Ahangama Circle</h1>

              <p className="new-home-hero__description">
                A private network of owners and creatives.
                <br />
                Recognised. Connected. Looked after.
              </p>

              <p className="new-home-hero__micro-proof">
                Owners • Founders • Creatives
              </p>

              <div className="new-home-hero__actions">
                <a
                  className="new-home-hero__button new-home-hero__button--primary"
                  href={membershipUrl}
                  onClick={onRequestAccessClick}
                >
                  Request access
                </a>
              </div>

              <p className="new-home-hero__microcopy">
                Handled privately via concierge
              </p>
            </div>
          </div>

          <div className="new-home-hero__visual-column">
            <div className="new-home-hero__visual">
              <div className="new-home-hero__visual-stage">
                <div
                  className="new-home-hero__pass-mockup"
                  aria-label="Ahangama pass preview"
                >
                  <div className="new-home-hero__pass-media-wrap">
                    <img
                      src={heroPassImage}
                      alt="Ahangama pass shown in an Apple Wallet style card"
                      className="new-home-hero__pass-image"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
