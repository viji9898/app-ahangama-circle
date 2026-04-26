import "./HomeHeroSection.css";

export default function HomeHeroSection({
  appleWalletIcon,
  googleWalletIcon,
  heroPassImage,
  passUrl = "https://pass.ahangama.com",
}) {
  return (
    <section id="hero" className="new-home-hero" aria-label="Hero">
      <div className="new-home-hero__shell">
        <div className="new-home-hero__row">
          <div className="new-home-hero__copy-column">
            <div className="new-home-hero__copy">
              <span className="new-home-hero__eyebrow">Ahangama Circle</span>

              <h1 className="new-home-hero__title">
                Save $50-$150 on your Ahangama trip
              </h1>

              <p className="new-home-hero__description">
                One pass. Instant discounts at 100+ places.
              </p>

              <p className="new-home-hero__micro-proof">
                Cafes • Stays • Surf • Wellness
              </p>

              <div className="new-home-hero__actions">
                <a
                  className="new-home-hero__button new-home-hero__button--primary"
                  href={passUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get your pass
                </a>

                <a
                  className="new-home-hero__button new-home-hero__button--secondary"
                  href="#how-it-works"
                >
                  See how it works
                </a>
              </div>

              <p className="new-home-hero__trust-line">
                Works instantly • No app needed • Takes 30 seconds
              </p>

              <div className="new-home-hero__wallet-support">
                <div className="new-home-hero__wallet-item">
                  <span>Add to Wallet</span>

                  <img
                    src={appleWalletIcon}
                    alt="Apple Wallet"
                    className="new-home-hero__wallet-icon"
                    draggable={false}
                  />

                  <img
                    src={googleWalletIcon}
                    alt="Google Wallet"
                    className="new-home-hero__wallet-icon"
                    draggable={false}
                  />
                </div>
              </div>
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
