import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SectionCard from "./components/SectionCard";
import SectionModal from "./components/SectionModal";
import Footer from "./components/Footer";
import "./styles/main.css";

const sections = [
  ["01", "Why Transit Matters", "The history of Houston's growth, policy decisions, and the roots of unequal transit access."],
  ["02", "Houston Transit Network", "Explore METRO bus routes, rail lines, and transit centers in an interactive network map."],
  ["03", "Transit Deserts", "Where high population meets low access. Identifying Houston's transit deserts."],
  ["04", "Who Has Access?", "Measuring transit accessibility and equity across Houston communities."],
  ["05", "Route Performance", "Which routes move the most people most efficiently?"],
  ["06", "Bus vs Rail", "Comparing ridership, coverage, productivity, and cost between bus and rail service."],
  ["07", "Investment Priorities", "Top transit corridors ranked by investment score and community impact."],
  ["08", "$500M Scenario", "How a hypothetical investment program could be allocated across Houston."],
  ["09", "University Line", "How the proposed University Line compares to today's top investment corridors."],
  ["10", "Red Line to Bush", "Who would benefit from extending the Red Line toward Bush Airport?"],
  ["11", "Conclusions", "Key takeaways and the path toward a more connected Houston."]
];

export default function App() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="site-shell">
      <Header />

      <main>
        <Hero />

        <section className="card-grid" aria-label="Project sections">
          {sections.map(([number, title, description]) => {
            const section = { number, title, description };

            return (
              <SectionCard
                key={number}
                number={number}
                title={title}
                description={description}
                onClick={() => setActiveSection(section)}
              />
            );
          })}

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