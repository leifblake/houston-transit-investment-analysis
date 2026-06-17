import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

const base = import.meta.env.BASE_URL;

const routeFilterModes = ["all", "bus", "rail", "park"];
const stopFilterModes = ["all", "bus", "rail", "park"];

const areaLabels = [
  { name: "Downtown", coordinates: [-95.3698, 29.7604], radius: 0.035 },
  { name: "Midtown", coordinates: [-95.3766, 29.7422], radius: 0.028 },
  { name: "Medical Center", coordinates: [-95.3975, 29.7079], radius: 0.035 },
  { name: "Uptown / Galleria", coordinates: [-95.4613, 29.739], radius: 0.04 },
  { name: "East End", coordinates: [-95.3267, 29.743], radius: 0.045 },
  { name: "Third Ward", coordinates: [-95.3535, 29.7275], radius: 0.035 },
  { name: "Northline", coordinates: [-95.398, 29.8508], radius: 0.04 },
  { name: "Westchase", coordinates: [-95.5594, 29.7336], radius: 0.05 },
  { name: "Greenspoint", coordinates: [-95.4136, 29.9441], radius: 0.05 },
  { name: "University of Houston", coordinates: [-95.3422, 29.7199], radius: 0.035 },
  { name: "Bellaire", coordinates: [-95.4597, 29.7058], radius: 0.04 },
];

function getValue(row, names) {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== "") return row[name];
  }
  return "";
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/&-]/g, "")
    .trim();
}

function getRouteMode(route) {
  const text = normalizeText(`${route.name} ${route.longName} ${route.routeId}`);

  if (text.includes("red")) return "rail-red";
  if (text.includes("green")) return "rail-green";
  if (text.includes("purple")) return "rail-purple";
  if (text.includes("silver")) return "rail-silver";

  return "bus";
}

function getRouteCategory(route) {
  const text = normalizeText(`${route.name} ${route.longName} ${route.routeId}`);

  if (
    text.includes("red") ||
    text.includes("green") ||
    text.includes("purple") ||
    text.includes("silver") ||
    String(route.type) === "2"
  ) {
    return "rail";
  }

  if (
    text.includes("park") ||
    text.includes("ride") ||
    text.includes("p&r") ||
    text.includes("commuter")
  ) {
    return "park";
  }

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
  const names = normalizeText(stop.routeNames);

  if (names.includes("red")) return "rail-red";
  if (names.includes("green")) return "rail-green";
  if (names.includes("purple")) return "rail-purple";
  if (names.includes("silver")) return "rail-silver";

  if (types.includes("2")) return "rail";
  if (types.includes("3")) return "bus";

  return "stop";
}

function getStopCategory(stop) {
  const text = normalizeText(`${stop.name} ${stop.routeNames} ${stop.routeTypes}`);

  if (
    text.includes("red") ||
    text.includes("green") ||
    text.includes("purple") ||
    text.includes("silver") ||
    text.includes("rail")
  ) {
    return "rail";
  }

  if (
    text.includes("park") ||
    text.includes("ride") ||
    text.includes("p&r")
  ) {
    return "park";
  }

  return "bus";
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

function distanceBetween(pointA, pointB) {
  const lonDistance = pointA[0] - pointB[0];
  const latDistance = pointA[1] - pointB[1];

  return Math.sqrt(lonDistance * lonDistance + latDistance * latDistance);
}

function findAreaSearch(searchTerm) {
  const normalizedTerm = normalizeText(searchTerm);

  if (!normalizedTerm) return null;

  return areaLabels.find((area) => {
    const normalizedArea = normalizeText(area.name);
    return (
      normalizedArea.includes(normalizedTerm) ||
      normalizedTerm.includes(normalizedArea)
    );
  });
}

function routeTouchesArea(route, area) {
  if (!area) return true;

  return route.coordinates.some(
    (coordinate) => distanceBetween(coordinate, area.coordinates) <= area.radius
  );
}

function stopTouchesArea(stop, area) {
  if (!area) return true;

  return distanceBetween(stop.coordinates, area.coordinates) <= area.radius;
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
  const [showLabels, setShowLabels] = useState(true);
  const [showStreets, setShowStreets] = useState(true);

  const [routeFilterIndex, setRouteFilterIndex] = useState(0);
  const [stopFilterIndex, setStopFilterIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const routeFilter = routeFilterModes[routeFilterIndex];
  const stopFilter = stopFilterModes[stopFilterIndex];
  const areaSearch = useMemo(() => findAreaSearch(searchTerm), [searchTerm]);

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
        (d) =>
          getValue(d, [
            "route_id",
            "RouteID",
            "route_short_name",
            "route",
          ]) || "Unknown"
      );

      const routeFeatures = Array.from(groupedRoutes, ([routeId, rows]) => {
        const first = rows[0];

        const coordinates = rows
          .map((row) => [
            Number(
              getValue(row, ["shape_pt_lon", "lon", "lng", "longitude"])
            ),
            Number(getValue(row, ["shape_pt_lat", "lat", "latitude"])),
          ])
          .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));

        return {
          routeId,
          name:
            getValue(first, [
              "route_short_name",
              "route_name",
              "route_long_name",
            ]) || routeId,
          longName: getValue(first, [
            "route_long_name",
            "long_name",
            "description",
          ]),
          type: getValue(first, ["route_type", "mode", "type"]),
          coordinates,
        };
      }).filter((route) => route.coordinates.length > 1);

      const stopFeatures = stopRows
        .map((row) => {
          const lat = Number(getValue(row, ["stop_lat", "lat", "latitude"]));
          const lon = Number(
            getValue(row, ["stop_lon", "lon", "lng", "longitude"])
          );

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

  const filteredRoutes = useMemo(() => {
    const term = normalizeText(searchTerm);
    const isAreaSearch = Boolean(areaSearch);

    return routes.filter((route) => {
      const category = getRouteCategory(route);

      if (routeFilter !== "all" && category !== routeFilter) return false;

      if (!term) return true;

      if (isAreaSearch) return routeTouchesArea(route, areaSearch);

      const searchable = normalizeText(
        `${route.name} ${route.longName} ${route.routeId}`
      );

      return searchable.includes(term);
    });
  }, [routes, routeFilter, searchTerm, areaSearch]);

  const filteredStops = useMemo(() => {
    const term = normalizeText(searchTerm);
    const isAreaSearch = Boolean(areaSearch);

    return stops.filter((stop) => {
      const category = getStopCategory(stop);

      if (stopFilter !== "all" && category !== stopFilter) return false;

      if (!term) return true;

      if (isAreaSearch) return stopTouchesArea(stop, areaSearch);

      const searchable = normalizeText(
        `${stop.name} ${stop.routeNames} ${stop.id}`
      );

      return searchable.includes(term);
    });
  }, [stops, stopFilter, searchTerm, areaSearch]);

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

    g.selectAll(".map-route")
      .data(filteredRoutes)
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

    if (showStops) {
      g.selectAll(".map-stop")
        .data(filteredStops)
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
      const k = event.transform.k;

      g.attr("transform", event.transform);

      g.selectAll(".map-route").attr("stroke-width", (route) => {
        const mode = getRouteMode(route);
        const baseWidth = mode === "bus" ? 2.1 : 3.4;
        return Math.max(0.65, baseWidth / Math.sqrt(k));
      });

      g.selectAll(".map-stop")
        .attr("r", Math.max(0.75, 2.1 / Math.sqrt(k)))
        .attr("stroke-width", Math.max(0.25, 0.55 / Math.sqrt(k)));

      g.selectAll(".area-label")
        .attr("font-size", Math.max(7, 13 / Math.sqrt(k)))
        .attr("stroke-width", Math.max(2, 5 / Math.sqrt(k)));

      g.selectAll(".street-line")
        .attr("stroke-width", 0.55)
        .attr("opacity", 0.34);

      g.selectAll(".tract-line")
        .attr("stroke-width", 0.55)
        .attr("opacity", 0.18);
    });

    svg.call(zoom);
  }, [
    bounds,
    routes,
    filteredRoutes,
    filteredStops,
    streets,
    tracts,
    showStops,
    showLabels,
    showStreets,
  ]);

  const activeDetail = selectedRoute || hoveredRoute;

  return (
    <>
      <div className="transit-network-map">
        <div className="map-toolbar">
          <button
            type="button"
            onClick={() =>
              setRouteFilterIndex(
                (index) => (index + 1) % routeFilterModes.length
              )
            }
          >
            {routeFilter === "all"
              ? "Show All Routes"
              : routeFilter === "bus"
              ? "Show Bus Routes"
              : routeFilter === "rail"
              ? "Show Rail Lines"
              : "Show Park & Ride"}
          </button>

          <button
            type="button"
            onClick={() =>
              setStopFilterIndex(
                (index) => (index + 1) % stopFilterModes.length
              )
            }
          >
            {stopFilter === "all"
              ? "Show All Stops"
              : stopFilter === "bus"
              ? "Show Bus Stops"
              : stopFilter === "rail"
              ? "Show Rail Stops"
              : "Show Park & Ride Stops"}
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

        <div className="map-search">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setSelectedRoute(null);
              setHoveredStop(null);
              setHoveredRoute(null);
              setTooltip(null);
            }}
            placeholder="Search route, stop, or area..."
            aria-label="Search route, stop, or area"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedRoute(null);
                setHoveredStop(null);
                setHoveredRoute(null);
                setTooltip(null);
              }}
              aria-label="Clear map search"
            >
              ×
            </button>
          )}
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 1200 620"
          role="img"
          aria-label="Interactive Houston METRO route, stop, street, and tract map"
        />

        {tooltip && (
          <div
            className="map-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <strong>{tooltip.label}</strong>
            <span>{tooltip.detail}</span>
          </div>
        )}

        <div className="map-legend">
          <div>
            <span className="legend-line legend-bus"></span>
            Bus route
          </div>
          <div>
            <span className="legend-line legend-red"></span>
            Red rail
          </div>
          <div>
            <span className="legend-line legend-green"></span>
            Green rail
          </div>
          <div>
            <span className="legend-line legend-purple"></span>
            Purple rail
          </div>
          <div>
            <span className="legend-line legend-street"></span>
            Street
          </div>
          <div>
            <span className="legend-dot"></span>
            Stop
          </div>
        </div>

        <div className="map-detail-card">
          {hoveredStop ? (
            <>
              <p>Selected Stop</p>
              <h4>{hoveredStop.name}</h4>
              <span>
                {hoveredStop.routeNames
                  ? `Routes: ${hoveredStop.routeNames}`
                  : "Houston METRO stop"}
              </span>
            </>
          ) : activeDetail ? (
            <>
              <p>Selected Route</p>
              <h4>{activeDetail.name}</h4>
              <span>{activeDetail.longName || "Houston METRO route"}</span>
            </>
          ) : searchTerm ? (
            <>
              <p>Search Active</p>
              <h4>{areaSearch ? areaSearch.name : searchTerm}</h4>
              <span>
                Showing {filteredRoutes.length} route
                {filteredRoutes.length === 1 ? "" : "s"}
                {showStops
                  ? ` and ${filteredStops.length} stop${
                      filteredStops.length === 1 ? "" : "s"
                    }`
                  : ""}
                .
              </span>
            </>
          ) : (
            <>
              <p>Map Hint</p>
              <h4>Click a route</h4>
              <span>
                Use the route and stop filters to reduce clutter. Stops are
                hidden by default.
              </span>
            </>
          )}
        </div>
      </div>

      <p className="map-caption">
        This GTFS-based map shows Houston METRO routes, optional stop locations,
        Harris County tract boundaries, and low-opacity street centerlines. Use
        the filters to isolate bus routes, rail lines, park-and-ride service, or
        specific stops and routes.
      </p>
    </>
  );
}