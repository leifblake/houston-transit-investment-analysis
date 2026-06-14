export default function Footer() {
  return (
    <footer className="site-footer" id="methodology">
      <div>
        <span className="footer-icon">✦</span>
        <h3>Methodology</h3>
        <p>Learn how the data was collected, cleaned, and analyzed.</p>
      </div>

      <div>
        <span className="footer-icon">▣</span>
        <h3>Notebook Archive</h3>
        <p>Explore the Jupyter notebooks behind the analysis.</p>
      </div>

      <div>
        <span className="footer-icon">●</span>
        <h3>Data Sources</h3>
        <p>GTFS, Census ACS, METRO ridership reports, and processed outputs.</p>
      </div>

      <div className="footer-brand">
        <strong>METRO</strong>
        <p>Moving Houston Forward.</p>
      </div>
    </footer>
  );
}
