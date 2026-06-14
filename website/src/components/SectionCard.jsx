export default function SectionCard({ number, title, description }) {
  return (
    <article className="section-card">
      <div className="card-heading">
        <span className="card-number">{number}</span>
        <h2>{title}</h2>
        <span className="spark">✦</span>
      </div>
      <div className="card-visual">
        <div className="mini-map"></div>
      </div>
      <p>{description}</p>
    </article>
  );
}
