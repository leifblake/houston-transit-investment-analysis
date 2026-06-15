import { useEffect } from "react";

const sectionImage = `${import.meta.env.BASE_URL}images/section_1_img.jpg`;

const modalContent = {
  "01": {
    eyebrow: "Historical Context",
    title: "Why Transit Access Matters",
    subtitle:
      "Houston’s transit gaps are tied to how the city grew: outward expansion, freeway construction, racial segregation, uneven public investment, and decades of car-centered planning.",
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
      <button
        className="modal-backdrop"
        onClick={onClose}
        aria-label="Close modal"
      />

      <article className="section-modal">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close section"
        >
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

          <div className="modal-poster image-poster">
            <img
              src={sectionImage}
              alt="Mid-century suburban street scene representing automobile-oriented growth"
              className="modal-poster-image"
            />
          </div>
        </header>

        <section className="modal-narrative-grid">
          <div className="modal-chapter">
            <p className="chapter-kicker">01 / Urban Form</p>
            <h2>Houston Was Built Around Cars</h2>

            <p>
              Houston’s modern growth followed a familiar Sun Belt pattern:
              outward expansion, low-density development, and highway-oriented
              mobility. That form made driving convenient for many households,
              but it also made transit harder to operate frequently and
              efficiently across the entire region.
            </p>

            <p>
              Transit access is not only about whether a bus stop exists nearby.
              It is about whether a person can reliably reach work, school,
              healthcare, groceries, and community life without needing a car.
            </p>
          </div>

          <aside className="modal-image-card redlining-card">
            <span>Future Map</span>
            <h3>Historic disinvestment patterns</h3>
            <p>
              Add a historic HOLC redlining map of Houston here, then pair it
              with present-day transit access or frequent-route coverage.
            </p>
          </aside>

          <aside className="book-quote-card">
            <p className="quote-label">Idea Card / The Color of Law</p>
            <blockquote>
              Segregation was not simply private choice. It was reinforced by
              public policy.
            </blockquote>
            <p>
              Richard Rothstein’s core argument helps frame why transit access
              today cannot be separated from housing discrimination, lending
              policy, and public investment decisions.
            </p>
          </aside>

          <div className="modal-chapter">
            <p className="chapter-kicker">02 / Housing Policy</p>
            <h2>Redlining and Segregation Left Long Shadows</h2>

            <p>
              In the 1930s, federal housing maps graded neighborhoods by lending
              risk. Areas marked as risky often had larger Black, immigrant, or
              working-class populations. These maps helped shape where mortgage
              credit and investment flowed, and where disinvestment persisted.
            </p>

            <p>
              In Houston, historic redlining and neighborhood valuation are
              important context for transit equity. Communities that experienced
              decades of exclusion often face layered barriers today: lower car
              access, longer trips, fewer high-frequency connections, and weaker
              links to regional job centers.
            </p>
          </div>

          <div className="modal-chapter wide">
            <p className="chapter-kicker">03 / Freeway Construction</p>
            <h2>Freeways Changed the Shape of the City</h2>

            <p>
              Freeways expanded regional mobility for drivers, but they also
              divided neighborhoods and encouraged growth farther from the urban
              core. In Houston, research on early freeway planning shows that
              proposed routes aligned closely with areas previously graded as
              declining or hazardous on HOLC maps.
            </p>

            <p>
              This matters for transit because highway infrastructure did more
              than move cars. It shaped which neighborhoods were connected,
              which were disrupted, and which travel patterns became easiest to
              serve.
            </p>
          </div>

          <aside className="modal-image-card freeway-card">
            <span>Image Idea</span>
            <h3>Freeway construction archive</h3>
            <p>
              Use an archival image of I-45, I-10, or US-59 construction, or a
              before/after aerial showing how a freeway divided a neighborhood.
            </p>
          </aside>

          <aside className="modal-quote">
            <p>
              Transportation access shapes access to employment, education,
              healthcare, and civic life.
            </p>
          </aside>

          <div className="modal-chapter">
            <p className="chapter-kicker">04 / Planning Choices</p>
            <h2>Infrastructure Is Never Neutral</h2>

            <p>
              Robert Caro’s <em>The Power Broker</em> is not about Houston, but
              it shows how highways, bridges, and public authorities can remake
              cities while concentrating benefits and burdens unevenly.
            </p>

            <p>
              Jane Jacobs’ <em>The Death and Life of Great American Cities</em>
              offers a different lens: streets, density, mixed uses, and daily
              neighborhood life matter. Transit works best when land use creates
              many nearby destinations and walkable connections.
            </p>
          </div>

          <aside className="book-quote-card red-card">
            <p className="quote-label">Idea Card / Arbitrary Lines</p>
            <blockquote>
              Land-use rules decide what kinds of places can exist.
            </blockquote>
            <p>
              M. Nolan Gray’s argument about zoning helps explain why transit
              cannot be separated from housing density, street design, and where
              cities allow people to live near opportunity.
            </p>
          </aside>

          <div className="modal-chapter">
            <p className="chapter-kicker">05 / Suburban Expansion</p>
            <h2>Growth Spread Faster Than Transit Could Follow</h2>

            <p>
              As Houston expanded outward, jobs and housing spread across a much
              larger region. That pattern made it harder for transit to compete
              with driving, especially where destinations are far apart and
              sidewalks, crossings, or frequent routes are limited.
            </p>

            <p>
              This does not mean transit cannot work in Houston. It means the
              strongest investments need to focus on corridors where demand,
              density, equity need, and network connections overlap.
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

          <div className="modal-takeaway">
            <h2>Why This Matters for the Project</h2>

            <p>
              This project evaluates Houston METRO not just as a set of routes,
              but as a system shaped by history. The following sections use
              GTFS, Census, ridership, accessibility, and investment-priority
              data to ask where transit works well, where access is limited, and
              where future investment could have the greatest impact.
            </p>

            <p className="source-note">
              Context sources: Mapping Inequality, Rice Baker Institute,
              Economic Policy Institute, Segregation by Design, and urban
              planning texts by Rothstein, Caro, Gray, and Jacobs.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}