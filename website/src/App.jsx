import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SectionCard from "./components/SectionCard";
import SectionModal from "./components/SectionModal";
import Footer from "./components/Footer";
import "./styles/main.css";

const section1Img = `${import.meta.env.BASE_URL}images/section_1_img.jpg`;

const sections = [
  {
    number: "01",
    title: "Why Transit Matters",
    description:
      "The history of Houston's growth, policy decisions, and the roots of unequal transit access.",
    image: section1Img,
    imageAlt:
      "Mid-century suburban street scene representing automobile-oriented growth",
  },
  {
    number: "02",
    title: "Houston Transit Network",
    description:
      "Explore METRO bus routes, rail lines, and transit centers in an interactive network map.",
  },
  {
    number: "03",
    title: "Transit Deserts",
    description:
      "Where high population meets low access. Identifying Houston's transit deserts.",
  },
  {
    number: "04",
    title: "Who Has Access?",
    description:
      "Measuring transit accessibility and equity across Houston communities.",
  },
  {
    number: "05",
    title: "Route Performance",
    description: "Which routes move the most people most efficiently?",
  },
  {
    number: "06",
    title: "Bus vs Rail",
    description:
      "Comparing ridership, coverage, productivity, and cost between bus and rail service.",
  },
  {
    number: "07",
    title: "Investment Priorities",
    description:
      "Top transit corridors ranked by investment score and community impact.",
  },
  {
    number: "08",
    title: "$500M Scenario",
    description:
      "How a hypothetical investment program could be allocated across Houston.",
  },
  {
    number: "09",
    title: "University Line",
    description:
      "How the proposed University Line compares to today's top investment corridors.",
  },
  {
    number: "10",
    title: "Red Line to Bush",
    description:
      "Who would benefit from extending the Red Line toward Bush Airport?",
  },
  {
    number: "11",
    title: "Conclusions",
    description:
      "Key takeaways and the path toward a more connected Houston.",
  },
];

export default function App() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="site-shell">
      <Header />

      <main>
        <Hero />

        <section className="card-grid" aria-label="Project sections">
          {sections.map((section) => (
            <SectionCard
              key={section.number}
              number={section.number}
              title={section.title}
              description={section.description}
              image={section.image}
              imageAlt={section.imageAlt}
              onClick={() => setActiveSection(section)}
            />
          ))}

          <article className="final-card">
            <h2>A Better Connected Houston</h2>
            <p>Data. Equity. Investment. Moving Houston forward.</p>
            <a href="#methodology">Get involved</a>
          </article>
        </section>
      </main>

      <Footer />

      {activeSection && (
      <SectionModal
        section={activeSection}
        onClose={() => setActiveSection(null)}
      />
      )}
      
    </div>
  );
}