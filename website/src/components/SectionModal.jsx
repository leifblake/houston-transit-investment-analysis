import { useEffect, useState } from "react";

const sectionImage = `${import.meta.env.BASE_URL}images/section_1_img.jpg`;
const redliningMap = `${import.meta.env.BASE_URL}images/houston_redlining_map.png`;
const metroSystemMap = `${import.meta.env.BASE_URL}images/metro_system_map.png`;

const interstateImages = [
  {
    label: "Freeway Construction Archive",
    title: "Gulf Freeway Traffic",
    src: `${import.meta.env.BASE_URL}images/interstate_1.jpg`,
    alt: "Cars traveling on Houston's Gulf Freeway in 1959",
    caption:
      "10/04/1959 — Traffic on Houston’s Gulf Freeway, an early symbol of the city’s freeway-oriented growth. Photo by Pete Vazquez / Houston Chronicle.",
  },
  {
    label: "Freeway Construction Archive",
    title: "Gulf Freeway Postcard",
    src: `${import.meta.env.BASE_URL}images/interstate_2.jpg`,
    alt: "Vintage postcard aerial view of the Gulf Freeway in Houston",
    caption:
      "HOUSTON — Vintage postcard showing an aerial view of the Gulf Freeway. Photo by Lake County Museum/Getty Images; Curt Teich Postcard Archives/Getty Images.",
  },
  {
    label: "Freeway Construction Archive",
    title: "Griggs Road Overpass",
    src: `${import.meta.env.BASE_URL}images/interstate_3.jpg`,
    alt: "Gulf Freeway overpass construction at Griggs Road and railroad tracks",
    caption:
      "11/17/1949 — Gulf Freeway jumping Griggs Road: overpass at Griggs and T. & N.O. Railroad tracks. Photo filed: Gulf Freeway — Houston.",
  },
  {
    label: "Freeway Construction Archive",
    title: "East End Aerial",
    src: `${import.meta.env.BASE_URL}images/interstate_4.jpg`,
    alt: "Aerial view of East End area near Gulf Freeway construction",
    caption:
      "02/1955 — Aerial view of the East End area near Gulf Freeway construction. Houston Chronicle Files.",
  },
  {
    label: "Freeway Construction Archive",
    title: "Telephone Road Construction",
    src: `${import.meta.env.BASE_URL}images/interstate_5.jpg`,
    alt: "Children crossing near Gulf Freeway construction at Telephone Road",
    caption:
      "10/01/1948 — Gulf Freeway construction near Telephone Road. About 250 students a day had to be escorted through the construction area to reach Henderson Elementary. Photo by Paul Seals / Houston Chronicle.",
  },
  {
    label: "Freeway Construction Archive",
    title: "Downtown Interchange",
    src: `${import.meta.env.BASE_URL}images/interstate_6.jpg`,
    alt: "Construction of interchange between US-59, Eastex Freeway, and I-45",
    caption:
      "06/1971 — Construction of the interchange between US-59, the Eastex Freeway, and I-45, the Gulf Freeway, photographed from the Pierce Elevated. Photo by Darrell Davidson / © Houston Chronicle.",
  },
];

const modalContent = {
  "01": {
    eyebrow: "Historical Context",
    title: "Why Transit Access Matters",
    subtitle:
      "Houston’s transit gaps are tied to how the city grew: outward expansion, freeway construction, racial segregation, uneven public investment, and decades of car-centered planning.",
  },
};

function MapGallery() {
  const [activeMap, setActiveMap] = useState(0);

  const maps = [
    {
      label: "1930s HOLC Map",
      title: "Historic Redlining Map",
      src: redliningMap,
      alt: "Historic HOLC redlining map of Houston",
    },
    {
      label: "Current METRO Map",
      title: "Current Transit Network",
      src: metroSystemMap,
      alt: "Current Houston METRO transit system map",
    },
  ];

  const current = maps[activeMap];

  function showPreviousMap() {
    setActiveMap((currentIndex) =>
      currentIndex === 0 ? maps.length - 1 : currentIndex - 1
    );
  }

  function showNextMap() {
    setActiveMap((currentIndex) =>
      currentIndex === maps.length - 1 ? 0 : currentIndex + 1
    );
  }

  return (
    <div className="map-gallery">
      <div className="map-gallery-topline">
        <span>{current.label}</span>

        <div className="map-gallery-controls">
          <button type="button" onClick={showPreviousMap} aria-label="Previous map">
            ‹
          </button>

          <button type="button" onClick={showNextMap} aria-label="Next map">
            ›
          </button>
        </div>
      </div>

      <h3>{current.title}</h3>

      <div className="map-gallery-frame">
        <img src={current.src} alt={current.alt} />
      </div>

      <p>
        Compare historic housing investment patterns with today’s transit
        geography to see how past planning decisions still shape access.
      </p>
    </div>
  );
}

function InterstateGallery() {
  const [activeImage, setActiveImage] = useState(0);

  const current = interstateImages[activeImage];

  function showPreviousImage() {
    setActiveImage((currentIndex) =>
      currentIndex === 0 ? interstateImages.length - 1 : currentIndex - 1
    );
  }

  function showNextImage() {
    setActiveImage((currentIndex) =>
      currentIndex === interstateImages.length - 1 ? 0 : currentIndex + 1
    );
  }

  return (
    <div className="interstate-gallery">
      <div className="map-gallery-topline">
        <span>{current.label}</span>

        <div className="map-gallery-controls">
          <button
            type="button"
            onClick={showPreviousImage}
            aria-label="Previous freeway image"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={showNextImage}
            aria-label="Next freeway image"
          >
            ›
          </button>
        </div>
      </div>

      <h3>{current.title}</h3>

      <div className="interstate-gallery-frame">
        <img src={current.src} alt={current.alt} />
      </div>

      <p className="interstate-caption">{current.caption}</p>
    </div>
  );
}

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

          <aside className="modal-image-card redlining-card map-gallery-card">
            <MapGallery />
          </aside>

            <aside className="book-quote-card">
            <p className="quote-label">The Color of Law</p>

            <blockquote>
                Segregation was not simply private choice. It was reinforced by public
                policy.
            </blockquote>

            <ul className="book-quote-list">
                <li>Housing policy shaped who could access stable neighborhoods.</li>
                <li>Public investment flowed unevenly across the city.</li>
                <li>Transit gaps today often sit on top of older housing inequities.</li>
            </ul>

            <p className="book-quote-source">
                — Richard Rothstein, <em>The Color of Law</em>
            </p>

            <div className="book-quote-divider" />

            <blockquote>
                Segregation by intentional government action is not de facto. Rather, it is
                what courts call de jure: segregation by law and public policy.
            </blockquote>

            <ul className="book-quote-list">
                <li>Redlining was not just a private market failure.</li>
                <li>Government-backed lending systems helped formalize unequal access.</li>
                <li>Those patterns affected wealth, mobility, and neighborhood services.</li>
            </ul>

            <p className="book-quote-source">
                — Richard Rothstein, <em>The Color of Law</em>
            </p>

            <div className="book-quote-divider" />

            <blockquote>
                The core argument of this book is that African Americans were
                unconstitutionally denied the means and the right to integration in
                middle-class neighborhoods.
            </blockquote>

            <ul className="book-quote-list">
                <li>Access to housing shaped access to schools, jobs, and public services.</li>
                <li>Transportation planning inherited these unequal geographies.</li>
                <li>Equity analysis should ask who benefits from future investment.</li>
            </ul>

            <p className="book-quote-source">
                — Richard Rothstein, <em>The Color of Law</em>
            </p>

            </aside>

          <div className="modal-chapter">
            <p className="chapter-kicker">02 / Housing Policy</p>
            <h2 className="long-heading">
              Redlining and Segregation Left Long Shadows
            </h2>

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

          <aside className="modal-image-card freeway-card interstate-gallery-card">
            <InterstateGallery />
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
                Transportation systems do more than move people. Decisions about where to
                build highways, transit lines, sidewalks, and housing shape who can reach
                jobs, schools, healthcare, and opportunity. Two influential urban thinkers
                offer different perspectives on how infrastructure changes cities.
            </p>

            <div className="planning-quote">
                <p className="planning-source">
                Robert Caro, <em>The Power Broker</em>
                </p>

                <blockquote>
                "Robert Moses's highways, bridges, and parks were instruments of power."
                </blockquote>

                <p>
                Caro's work shows how transportation investments can redistribute
                benefits and burdens unevenly across communities. Highways can increase
                regional mobility while simultaneously dividing neighborhoods and
                concentrating environmental, economic, and social costs.
                </p>
            </div>

            <div className="planning-quote">
                <p className="planning-source">
                Jane Jacobs, <em>The Death and Life of Great American Cities</em>
                </p>

                <blockquote>
                "Cities have the capability of providing something for everybody, only
                because, and only when, they are created by everybody."
                </blockquote>

                <p>
                Jacobs argued that vibrant neighborhoods depend on density, mixed land
                uses, walkability, and connected streets. Her work helps explain why
                successful transit systems rely not only on routes and vehicles, but on
                the surrounding urban form and the destinations people can reach.
                </p>
            </div>

            <p>
                Together, these perspectives help frame Houston's transit challenges:
                infrastructure decisions made decades ago continue to influence where
                people live, how they travel, and who has access to opportunity today.
            </p>
            </div>

          <aside className="book-quote-card red-card">
            <p className="quote-label">Arbitrary Lines</p>
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
              Economic Policy Institute, Segregation by Design, Houston
              Chronicle archival reporting, and urban planning texts by
              Rothstein, Caro, Gray, and Jacobs.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}