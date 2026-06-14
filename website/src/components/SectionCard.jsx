export default function SectionCard({ number, title, description, onClick }) {
  return (
    <article className="section-card" onClick={onClick} role="button" tabIndex={0}>
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