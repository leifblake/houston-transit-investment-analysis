import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

const base = import.meta.env.BASE_URL;

function getValue(row, names) {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== "") return row[name];
  }
  return "";
}

function parseGeometry(row) {
  const geometryText = getValue(row, ["geometry", "geom", "wkt", "geojson"]);

  if (geometryText) {
    try {
      const parsed = JSON.parse(geometryText);
      if (parsed.type === "LineString") return parsed.coordinates;
      if (parsed.type === "MultiLineString") return parsed.coordinates.flat();
    } catch {
      return null;
    }
  }

  const lat = Number(getValue(row, ["lat", "latitude", "shape_pt_lat"]));
  const lon = Number(getValue(row, ["lon", "lng", "longitude", "shape_pt_lon"]));

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return [[lon, lat]];
  }

  return null;
}

export default function TransitNetworkMap() {
  const svgRef = useRef(null);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showStops, setShowStops] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [routeRows, stopRows] = await Promise.all([
        d3.csv(`${base}data/key_route_geometry.csv`),
        d3.csv(`${base}data/clean_stops.csv`),
      ]);

      const groupedRoutes = d3.group(
        routeRows,
        (d) =>
          getValue(d, ["route_id", "RouteID", "route_short_name", "route"]) ||
          "Unknown"
      );

      const routeFeatures = Array.from(groupedRoutes, ([routeId, rows]) => {
        const first = rows[0];

        let coordinates = [];

        rows.forEach((row) => {
          const parsed = parseGeometry(row);
          if (parsed) coordinates.push(...parsed);
        });

        coordinates = coordinates.filter(
          ([lon, lat]) => Number.isFinite(Number(lon)) && Number.isFinite(Number(lat))
        );

        return {
          routeId,
          name:
            getValue(first, ["route_short_name", "route_name", "route_long_name"]) ||
            routeId,
          longName: getValue(first, ["route_long_name", "long_name", "description"]),
          type: getValue(first, ["route_type", "mode", "type"]),
          coordinates,
        };
      }).filter((route) => route.coordinates.length > 1);

      const stopFeatures = stopRows
        .map((row) => {
          const lat = Number(getValue(row, ["stop_lat", "lat", "latitude"]));
          const lon = Number(getValue(row, ["stop_lon", "lon", "lng", "longitude"]));

          return {
            id: getValue(row, ["stop_id", "id"]),
            name: getValue(row, ["stop_name", "name"]) || "Stop",
            coordinates: [lon, lat],
          };
        })
        .filter((stop) => Number.isFinite(stop.coordinates[0]) && Number.isFinite(stop.coordinates[1]));

      setRoutes(routeFeatures);
      setStops(stopFeatures);
    }

    loadData();
  }, []);

  const bounds = useMemo(() => {
    const points = [
      ...routes.flatMap((route) => route.coordinates),
      ...stops.map((stop) => stop.coordinates),
    ];

    if (!points.length) return null;

    return {
      type: "FeatureCollection",
      features: points.map(([lon, lat]) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
      })),
    };
  }, [routes, stops]);

  useEffect(() => {
    if (!svgRef.current || !bounds || !routes.length) return;

    const width = 1200;
    const height = 620;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoMercator().fitSize([width, height], bounds);
    const path = d3.geoPath(projection);

    const g = svg.append("g");

    const routeColor = (route) => {
      const name = String(route.name).toLowerCase();

      if (name.includes("red")) return "#ed1b2f";
      if (name.includes("green")) return "#1a9850";
      if (name.includes("purple")) return "#7b3294";
      if (name.includes("silver")) return "#8f9aa3";
      return "#0055a4";
    };

    if (showRoutes) {
      g.selectAll(".map-route")
        .data(routes)
        .join("path")
        .attr("class", "map-route")
        .attr("d", (route) =>
          path({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: route.coordinates,
            },
          })
        )
        .attr("stroke", routeColor)
        .on("click", (_, route) => setSelectedRoute(route));
    }

    if (showStops) {
      g.selectAll(".map-stop")
        .data(stops)
        .join("circle")
        .attr("class", "map-stop")
        .attr("cx", (stop) => projection(stop.coordinates)?.[0])
        .attr("cy", (stop) => projection(stop.coordinates)?.[1])
        .attr("r", 1.8);
    }

    const zoom = d3.zoom().scaleExtent([1, 12]).on("zoom", (event) => {
      g.attr("transform", event.transform);
      g.selectAll(".map-route").attr("stroke-width", 2.4 / event.transform.k);
      g.selectAll(".map-stop").attr("r", Math.max(0.9, 1.8 / event.transform.k));
    });

    svg.call(zoom);
  }, [bounds, routes, stops, showRoutes, showStops]);

  return (
    <div className="transit-network-map">
      <div className="map-toolbar">
        <button type="button" onClick={() => setShowRoutes((value) => !value)}>
          {showRoutes ? "Hide Routes" : "Show Routes"}
        </button>

        <button type="button" onClick={() => setShowStops((value) => !value)}>
          {showStops ? "Hide Stops" : "Show Stops"}
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 1200 620"
        role="img"
        aria-label="Interactive Houston METRO route and stop map"
      />

      <div className="map-detail-card">
        {selectedRoute ? (
          <>
            <p>Selected Route</p>
            <h4>{selectedRoute.name}</h4>
            <span>{selectedRoute.longName || "Houston METRO route"}</span>
          </>
        ) : (
          <>
            <p>Map Hint</p>
            <h4>Click a route</h4>
            <span>Use scroll or trackpad to zoom and drag to pan.</span>
          </>
        )}
      </div>
    </div>
  );
}