import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

const base = import.meta.env.BASE_URL;

function milesBetween(a, b) {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(x));
}

function getDensityColor(score) {
  if (score >= 0.78) return "rgba(237, 27, 47, 0.72)";
  if (score >= 0.58) return "rgba(237, 27, 47, 0.46)";
  if (score >= 0.38) return "rgba(242, 140, 40, 0.38)";
  return "rgba(0, 85, 164, 0.08)";
}

export default function TransitDesertMap() {
  const svgRef = useRef(null);

  const [tracts, setTracts] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedTract, setSelectedTract] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [tractGeojson, routeRows, stopRows] = await Promise.all([
        d3.json(`${base}data/harris_tracts_with_population.geojson`),
        d3.csv(`${base}data/all_route_geometry.csv`),
        d3.csv(`${base}data/stops_enriched.csv`),
      ]);

      const groupedRoutes = d3.group(routeRows, (d) => d.route_id);

      const routeFeatures = Array.from(groupedRoutes, ([routeId, rows]) => {
        const first = rows[0];

        const coordinates = rows
          .filter((_, index) => index % 6 === 0)
          .map((row) => [
            Number(row.shape_pt_lon),
            Number(row.shape_pt_lat),
          ])
          .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));

        return {
          routeId,
          name: first.route_short_name || routeId,
          longName: first.route_long_name || "",
          coordinates,
        };
      }).filter((route) => route.coordinates.length > 1);

      const stopFeatures = stopRows
        .map((row) => ({
          id: row.stop_id,
          name: row.stop_name || "METRO stop",
          coordinates: [Number(row.stop_lon), Number(row.stop_lat)],
        }))
        .filter((stop) =>
          stop.coordinates.every((value) => Number.isFinite(value))
        );

      const stopCoordinates = stopFeatures.map((stop) => stop.coordinates);

      const enrichedTracts = {
        ...tractGeojson,
        features: tractGeojson.features.map((feature) => {
          const props = feature.properties;
          const centroid = [
            Number(props.INTPTLON),
            Number(props.INTPTLAT),
          ];

          const landSqMiles = Number(props.ALAND || 0) / 2589988.11;
          const population = Number(props.population || 0);
          const density = landSqMiles > 0 ? population / landSqMiles : 0;

          let nearestStopMiles = Infinity;

          for (const stop of stopCoordinates) {
            const distance = milesBetween(centroid, stop);
            if (distance < nearestStopMiles) nearestStopMiles = distance;
          }

          return {
            ...feature,
            properties: {
              ...props,
              centroid,
              population,
              density,
              nearestStopMiles,
            },
          };
        }),
      };

      const densities = enrichedTracts.features
        .map((feature) => feature.properties.density)
        .filter(Number.isFinite);

      const distances = enrichedTracts.features
        .map((feature) => feature.properties.nearestStopMiles)
        .filter(Number.isFinite);

      const densityScale = d3
        .scaleLinear()
        .domain(d3.extent(densities))
        .range([0, 1]);

      const distanceScale = d3
        .scaleLinear()
        .domain(d3.extent(distances))
        .range([0, 1]);

      enrichedTracts.features = enrichedTracts.features.map((feature) => {
        const densityScore = densityScale(feature.properties.density);
        const accessGapScore = distanceScale(feature.properties.nearestStopMiles);
        const desertScore = densityScore * 0.62 + accessGapScore * 0.38;

        return {
          ...feature,
          properties: {
            ...feature.properties,
            densityScore,
            accessGapScore,
            desertScore,
          },
        };
      });

      setTracts(enrichedTracts);
      setRoutes(routeFeatures);
      setStops(stopFeatures);
    }

    loadData();
  }, []);

  const insights = useMemo(() => {
    if (!tracts) return null;

    const ranked = [...tracts.features].sort(
      (a, b) => b.properties.desertScore - a.properties.desertScore
    );

    const top = ranked[0]?.properties;
    const avgDistance = d3.mean(
      tracts.features,
      (feature) => feature.properties.nearestStopMiles
    );

    return {
      tracts: tracts.features.length,
      topName: top?.NAMELSAD || "Highest-scoring tract",
      topScore: top?.desertScore || 0,
      topPopulation: top?.population || 0,
      topDensity: top?.density || 0,
      avgDistance: avgDistance || 0,
    };
  }, [tracts]);

  useEffect(() => {
    if (!svgRef.current || !tracts || !routes.length) return;

    const width = 1200;
    const height = 620;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoMercator().fitSize([width, height], tracts);
    const path = d3.geoPath(projection);

    const g = svg.append("g");

    g.append("g")
      .attr("class", "desert-tract-layer")
      .selectAll("path")
      .data(tracts.features)
      .join("path")
      .attr("class", "desert-tract")
      .attr("d", path)
      .attr("fill", (feature) => getDensityColor(feature.properties.desertScore))
      .attr("stroke", "rgba(7, 27, 51, 0.18)")
      .attr("stroke-width", 0.55)
      .on("mousemove", (event, feature) => {
        setTooltip({
          x: event.offsetX,
          y: event.offsetY,
          title: feature.properties.NAMELSAD,
          body: `${feature.properties.population.toLocaleString()} people • ${Math.round(
            feature.properties.density
          ).toLocaleString()} people/sq mi • ${feature.properties.nearestStopMiles.toFixed(
            2
          )} mi to nearest stop`,
        });
      })
      .on("mouseleave", () => setTooltip(null))
      .on("click", (_, feature) => setSelectedTract(feature.properties));

    g.append("g")
      .attr("class", "desert-route-layer")
      .selectAll("path")
      .data(routes)
      .join("path")
      .attr("class", "desert-route")
      .attr("d", (route) =>
        path({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: route.coordinates,
          },
        })
      );

    g.append("g")
      .attr("class", "desert-stop-layer")
      .selectAll("circle")
      .data(stops.filter((_, index) => index % 3 === 0))
      .join("circle")
      .attr("class", "desert-stop")
      .attr("cx", (stop) => projection(stop.coordinates)?.[0])
      .attr("cy", (stop) => projection(stop.coordinates)?.[1])
      .attr("r", 1.3);

    const zoom = d3.zoom().scaleExtent([1, 10]).on("zoom", (event) => {
      const k = event.transform.k;
      g.attr("transform", event.transform);

      g.selectAll(".desert-route").attr("stroke-width", Math.max(0.7, 1.8 / Math.sqrt(k)));
      g.selectAll(".desert-stop").attr("r", Math.max(0.6, 1.3 / Math.sqrt(k)));
      g.selectAll(".desert-tract").attr("stroke-width", Math.max(0.25, 0.55 / Math.sqrt(k)));
    });

    svg.call(zoom);
  }, [tracts, routes, stops]);

  return (
    <div className="transit-desert-map">
      <aside className="desert-insights">
        <p className="desert-panel-label">Key Insights</p>

        <h3>Transit Desert Score</h3>

        <p>
          Tracts are shaded by a simple score combining population density and
          distance to the nearest METRO stop.
        </p>

        {insights && (
          <div className="desert-stats">
            <div>
              <strong>{insights.tracts}</strong>
              <span>Harris County tracts</span>
            </div>

            <div>
              <strong>{insights.avgDistance.toFixed(2)} mi</strong>
              <span>Average nearest-stop distance</span>
            </div>

            <div>
              <strong>{insights.topPopulation.toLocaleString()}</strong>
              <span>Population in highest-scoring tract</span>
            </div>
          </div>
        )}

        <div className="desert-legend">
          <span><i className="high"></i> Highest gap</span>
          <span><i className="medium"></i> Moderate gap</span>
          <span><i className="low"></i> Lower gap</span>
          <span><i className="route"></i> METRO route</span>
          <span><i className="stop"></i> Sampled stop</span>
        </div>
      </aside>

      <div className="desert-map-stage">
        <svg
          ref={svgRef}
          viewBox="0 0 1200 620"
          role="img"
          aria-label="Transit desert map of Harris County"
        />

        {tooltip && (
          <div
            className="desert-tooltip"
            style={{ left: tooltip.x + 16, top: tooltip.y + 16 }}
          >
            <strong>{tooltip.title}</strong>
            <span>{tooltip.body}</span>
          </div>
        )}

        {selectedTract && (
          <div className="selected-desert-card">
            <p>Selected Tract</p>
            <h4>{selectedTract.NAMELSAD}</h4>
            <span>{selectedTract.population.toLocaleString()} people</span>
            <span>{Math.round(selectedTract.density).toLocaleString()} people/sq mi</span>
            <span>{selectedTract.nearestStopMiles.toFixed(2)} mi to nearest stop</span>
          </div>
        )}
      </div>
    </div>
  );
}