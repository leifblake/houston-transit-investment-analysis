export default function SectionCard({
  number,
  title,
  description,
  image,
  imageAlt,
  onClick,
}) {
  return (
    <article
      className="section-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClick();
        }
      }}
    >
      <div className="card-heading">
        <span className="card-number">{number}</span>
        <h2>{title}</h2>
        <span className="spark">✦</span>
      </div>

      <div className="card-visual">
        {image ? (
          <img src={image} alt={imageAlt || title} className="card-image" />
        ) : (
          <div className="mini-map"></div>
        )}
      </div>

      <p>{description}</p>
    </article>
  );
}