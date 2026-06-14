export default function Hero() {
  return (
    <section className="hero" id="story">
      <div className="hero-copy">
        <p className="eyebrow">Houston Transit Investment Analysis</p>

        <h1>
          Who Gets
          <br />
          Access to Transit
          <span>in Houston?</span>
        </h1>

        <div className="divider"></div>

        <p>
          Exploring transit access, equity, and investment priorities across the
          Houston METRO system.
        </p>

        <a className="outline-button" href="#data">Explore the Story</a>
      </div>

      <div className="hero-image-wrap">
        <img
          src={`${import.meta.env.BASE_URL}images/metro_website_logo_rmbg.png`}
          alt="Stylized Houston METRO bus with Houston skyline"
          className="hero-image"
        />
      </div>
    </section>
  );
}