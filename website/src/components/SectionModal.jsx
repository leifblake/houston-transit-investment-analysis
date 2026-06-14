import { useEffect } from "react";

const modalContent = {
  "01": {
    eyebrow: "Historical Context",
    title: "Why Transit Access Matters",
    subtitle:
      "Houston’s transit gaps are not random. They reflect decades of land-use decisions, freeway building, segregation, redlining, and suburban expansion.",
  },
};

export default function SectionModal({ section, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!section) return null;

  const content = modalContent[section.number];

  if (!content) return null;

  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close modal" />

      <article className="section-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close section">
          ×
        </button>

        <header className="modal-hero">
          <div>
            <p className="modal-eyebrow">{content.eyebrow}</p>
            <div className="modal-title-row">
              <span>{section.number}</span>
              <h1>{content.title}</h1>
            </div>
            <p className="modal-subtitle">{content.subtitle}</p>
          </div>

          <div className="modal-poster">
            <div className="poster-sun"></div>
            <div className="poster-road poster-road-blue"></div>
            <div className="poster-road poster-road-red"></div>
            <div className="poster-block poster-block-one"></div>
            <div className="poster-block poster-block-two"></div>
            <div className="poster-block poster-block-three"></div>
          </div>
        </header>

        <section className="modal-narrative-grid">
          <div className="modal-chapter">
            <p className="chapter-kicker">01 / Urban Form</p>
            <h2>Houston Was Built Around Cars</h2>
            <p>
              Houston grew outward during the same decades that American cities
              were being reshaped around highways, low-density development, and
              automobile ownership. That growth pattern made transit harder to
              operate efficiently because destinations became more spread out
              and daily life became increasingly dependent on driving.
            </p>
            <p>
              In a city where jobs, housing, schools, healthcare, and services
              are distributed across a large region, transit access is not only
              about whether a bus stop exists nearby. It is about whether the
              network can connect people to opportunity in a reasonable amount
              of time.
            </p>
          </div>

          <aside className="modal-image-card redlining-card">
            <span>Map Placeholder</span>
            <h3>Historic disinvestment patterns</h3>
            <p>
              Future version: add a historic redlining or neighborhood
              investment map with present-day transit access layered nearby.
            </p>
          </aside>

          <aside className="modal-quote">
            <p>
              Transportation access shapes access to employment, education,
              healthcare, and civic life.
            </p>
          </aside>

          <div className="modal-chapter">
            <p className="chapter-kicker">02 / Housing Policy</p>
            <h2>Redlining and Segregation Left Long Shadows</h2>
            <p>
              Books such as <em>The Color of Law</em> show how housing policy,
              lending discrimination, and segregation shaped where people could
              live and where investment flowed. These choices influenced the
              geography of wealth, infrastructure, and public services.
            </p>
            <p>
              For transit analysis, that matters because communities that were
              historically excluded from investment often face compounded
              barriers today: lower car access, longer travel times, fewer
              high-frequency routes, and weaker connections to regional job
              centers.
            </p>
          </div>

          <div className="modal-chapter wide">
            <p className="chapter-kicker">03 / Freeway Construction</p>
            <h2>Freeways Changed the Shape of the City</h2>
            <p>
              The freeway era reorganized Houston’s geography. Highways improved
              regional automobile mobility, but they also divided neighborhoods,
              encouraged outward development, and made transit less competitive
              across many corridors.
            </p>
            <p>
              The lesson from works like <em>The Power Broker</em> is that
              infrastructure is never neutral. The placement of major roads,
              transit lines, and public investments can determine which places
              become connected and which places become bypassed.
            </p>
          </div>

          <aside className="modal-stat">
            <strong>Access</strong>
            <span>is the real metric</span>
            <p>
              The central question is not simply where transit exists, but who
              can use it to reach daily needs.
            </p>
          </aside>

          <div className="modal-chapter">
            <p className="chapter-kicker">04 / Suburban Expansion</p>
            <h2>Growth Spread Faster Than Transit Could Follow</h2>
            <p>
              Houston’s suburban expansion created a region where many trips do
              not begin or end downtown. Jobs decentralized, housing spread
              outward, and transit agencies had to serve a much larger area with
              limited resources.
            </p>
            <p>
              <em>Arbitrary Lines</em> and <em>The Death and Life of Great
              American Cities</em> both help frame why land use matters.
              Zoning, street design, density, and mixed-use development all
              influence whether transit can be frequent, useful, and equitable.
            </p>
          </div>

          <div className="modal-takeaway">
            <h2>Why This Matters for the Project</h2>
            <p>
              This project evaluates Houston METRO not just as a set of routes,
              but as a system shaped by history. The following sections use
              GTFS, Census, ridership, accessibility, and investment-priority
              data to ask where transit works well, where access is limited, and
              where future investment could have the greatest impact.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}