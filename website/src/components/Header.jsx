export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#">
        <span className="brand-mark">
          <span></span><span></span><span></span>
        </span>
        <span>
          <strong>METRO</strong>
          <small>Moving Houston Forward</small>
        </span>
      </a>

      <nav className="site-nav" aria-label="Main navigation">
        <a href="#">Home</a>
        <a href="#story">The Story</a>
        <a href="#data">The Data</a>
        <a href="#future">The Future</a>
        <a href="#about">About</a>
      </nav>

      <a className="header-button" href="#map">Explore the Map</a>
    </header>
  );
}
