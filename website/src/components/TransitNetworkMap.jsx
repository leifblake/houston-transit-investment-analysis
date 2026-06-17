import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

const base = import.meta.env.BASE_URL;

const areaLabels = [
  { name: "Downtown", coordinates: [-95.3698, 29.7604] },
  { name: "Midtown", coordinates: [-95.3766, 29.7422] },
  { name: "Medical Center", coordinates: [-95.3975, 29.7079] },
  { name: "Uptown / Galleria", coordinates: [-95.4613, 29.739] },
  { name: "East End", coordinates: [-95.3267, 29.743] },
  { name: "Third Ward", coordinates: [-95.3535, 29.7275] },
  { name: "Northline", coordinates: [-95.398, 29.8508] },
  { name: "Westchase", coordinates: [-95.5594, 29.7336] },
  { name: "Greenspoint", coordinates: [-95.4136, 29.9441] },
];

function getValue(row, names) {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== "") return row[name];
  }
  return "";
}

function getRouteMode(route) {
  const text = `${route.name} ${route.longName} ${route.routeId}`.toLowerCase();

  if (text.includes("red")) return "rail-red";
  if (text.includes("green")) return "rail-green";
  if (text.includes("purple")) return "rail-purple";
  if (text.includes("silver")) return "rail-silver";

  return "bus";
}

function getRouteColor(route) {
  const mode = getRouteMode(route);

  if (mode === "rail-red") return "#ed1b2f";
  if (mode === "rail-green") return "#1a9850";
  if (mode === "rail-purple") return "#7b3294";
  if (mode === "rail-silver") return "#8f9aa3";

  return "#0055a4";
}

function getStopMode(stop) {
  const types = String(stop.routeTypes || "");
  const names = String(stop.routeNames || "").toLowerCase();

  if (names.includes("red")) return "rail-red";
  if (names.includes("green")) return "rail-green";
  if (names.includes("purple")) return "rail-purple";
  if (names.includes("silver")) return "rail-silver";

  if (types.includes("2")) return "rail";
  if (types.includes("3")) return "bus";

  return "stop";
}

function getStopColor(stop) {
  const mode = getStopMode(stop);

  if (mode === "rail-red") return "#ed1b2f";
  if (mode === "rail-green") return "#1a9850";
  if (mode === "rail-purple") return "#7b3294";
  if (mode === "rail-silver") return "#8f9aa3";
  if (mode === "rail") return "#7b3294";
  if (mode === "bus") return "#0055a4";

  return "#5f6b78";
}

export default function TransitNetworkMap() {
  const svgRef = useRef(null);

  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [streets, setStreets] = useState(null);
  const [tracts, setTracts] = useState(null);

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [hoveredStop, setHoveredStop] = useState(null);
  const [hoveredRoute, setHoveredRoute] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const [showStops, setShowStops] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showStreets, setShowStreets] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [routeRows, stopRows, harrisTracts, houstonStreets] =
        await Promise.all([
          d3.csv(`${base}data/all_route_geometry.csv`),
          d3.csv(`${base}data/stops_enriched.csv`),
          d3.json(`${base}data/harris_tracts.geojson`),
          d3.json(`${base}data/houston_streets.geojson`).catch(() => null),
        ]);

      const groupedRoutes = d3.group(
        routeRows,
        (d) => getValue(d, ["route_id", "RouteID", "route_short_name", "route"]) || "Unknown"
      );

      const routeFeatures = Array.from(groupedRoutes, ([routeId, rows]) => {
        const first = rows[0];

        const coordinates = rows
          .map((row) => [
            Number(getValue(row, ["shape_pt_lon", "lon", "lng", "longitude"])),
            Number(getValue(row, ["shape_pt_lat", "lat", "latitude"])),
          ])
          .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));

        return {
          routeId,
          name: getValue(first, ["route_short_name", "route_name", "route_long_name"]) || routeId,
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
            routeNames: getValue(row, ["route_names"]),
            routeTypes: getValue(row, ["route_types"]),
            coordinates: [lon, lat],
          };
        })
        .filter(
          (stop) =>
            Number.isFinite(stop.coordinates[0]) &&
            Number.isFinite(stop.coordinates[1])
        );

      setRoutes(routeFeatures);
      setStops(stopFeatures);
      setTracts(harrisTracts);
      setStreets(houstonStreets);
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
        geometry: { type: "Point", coordinates: [lon, lat] },
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

    if (showStreets && streets?.features) {
      g.append("g")
        .attr("class", "street-layer")
        .selectAll(".street-line")
        .data(streets.features)
        .join("path")
        .attr("class", "street-line")
        .attr("d", path);
    }

    if (tracts?.features) {
      g.append("g")
        .attr("class", "tract-layer")
        .selectAll(".tract-line")
        .data(tracts.features)
        .join("path")
        .attr("class", "tract-line")
        .attr("d", path);
    }

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
        .attr("stroke", getRouteColor)
        .attr("data-mode", (route) => getRouteMode(route))
        .on("mousemove", (event, route) => {
          setHoveredRoute(route);
          setTooltip({
            x: event.offsetX,
            y: event.offsetY,
            label: `Route ${route.name}`,
            detail: route.longName || "Houston METRO route",
          });
        })
        .on("mouseleave", () => {
          setHoveredRoute(null);
          setTooltip(null);
        })
        .on("click", (_, route) => setSelectedRoute(route));
    }

    if (showStops) {
      g.selectAll(".map-stop")
        .data(stops)
        .join("circle")
        .attr("class", "map-stop")
        .attr("cx", (stop) => projection(stop.coordinates)?.[0])
        .attr("cy", (stop) => projection(stop.coordinates)?.[1])
        .attr("r", 2.1)
        .attr("fill", getStopColor)
        .on("mousemove", (event, stop) => {
          setHoveredStop(stop);
          setTooltip({
            x: event.offsetX,
            y: event.offsetY,
            label: stop.name,
            detail: stop.routeNames
              ? `Routes: ${stop.routeNames}`
              : stop.id
              ? `Stop ID: ${stop.id}`
              : "METRO stop",
          });
        })
        .on("mouseleave", () => {
          setHoveredStop(null);
          setTooltip(null);
        });
    }

    if (showLabels) {
      g.selectAll(".area-label")
        .data(areaLabels)
        .join("text")
        .attr("class", "area-label")
        .attr("x", (label) => projection(label.coordinates)?.[0])
        .attr("y", (label) => projection(label.coordinates)?.[1])
        .text((label) => label.name);
    }

    const zoom = d3.zoom().scaleExtent([1, 12]).on("zoom", (event) => {
      g.attr("transform", event.transform);
      g.selectAll(".map-route").attr("stroke-width", 2.2 / event.transform.k);
      g.selectAll(".map-stop").attr("r", Math.max(1, 2.1 / event.transform.k));
      g.selectAll(".area-label").attr("font-size", Math.max(8, 13 / event.transform.k));
      g.selectAll(".street-line").attr("stroke-width", 0.5 / event.transform.k);
      g.selectAll(".tract-line").attr("stroke-width", 0.55 / event.transform.k);
    });

    svg.call(zoom);
  }, [bounds, routes, stops, streets, tracts, showRoutes, showStops, showLabels, showStreets]);

  const activeDetail = selectedRoute || hoveredRoute;

  return (
    <div className="transit-network-map">
      <div className="map-toolbar">
        <button type="button" onClick={() => setShowRoutes((value) => !value)}>
          {showRoutes ? "Hide Routes" : "Show Routes"}
        </button>

        <button type="button" onClick={() => setShowStops((value) => !value)}>
          {showStops ? "Hide Stops" : "Show Stops"}
        </button>

        <button type="button" onClick={() => setShowLabels((value) => !value)}>
          {showLabels ? "Hide Labels" : "Show Labels"}
        </button>

        <button type="button" onClick={() => setShowStreets((value) => !value)}>
          {showStreets ? "Hide Streets" : "Show Streets"}
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 1200 620"
        role="img"
        aria-label="Interactive Houston METRO route, stop, street, and tract map"
      />

      {tooltip && (
        <div className="map-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <strong>{tooltip.label}</strong>
          <span>{tooltip.detail}</span>
        </div>
      )}

      <div className="map-legend">
        <div><span className="legend-line legend-bus"></span>Bus route</div>
        <div><span className="legend-line legend-red"></span>Red rail</div>
        <div><span className="legend-line legend-green"></span>Green rail</div>
        <div><span className="legend-line legend-purple"></span>Purple rail</div>
        <div><span className="legend-line legend-street"></span>Street</div>
        <div><span className="legend-dot"></span>Stop</div>
      </div>

      <div className="map-detail-card">
        {hoveredStop ? (
          <>
            <p>Selected Stop</p>
            <h4>{hoveredStop.name}</h4>
            <span>{hoveredStop.routeNames ? `Routes: ${hoveredStop.routeNames}` : "Houston METRO stop"}</span>
          </>
        ) : activeDetail ? (
          <>
            <p>Selected Route</p>
            <h4>{activeDetail.name}</h4>
            <span>{activeDetail.longName || "Houston METRO route"}</span>
          </>
        ) : (
          <>
            <p>Map Hint</p>
            <h4>Click a route</h4>
            <span>Stops are hidden by default. Turn them on to inspect stop locations.</span>
          </>
        )}
      </div>

      <p className="map-caption">
        This GTFS-based map shows Houston METRO routes, optional stop locations,
        Harris County tract boundaries, and low-opacity street centerlines. Area
        labels are approximate reference points.
      </p>
    </div>
  );
}