import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

const base = import.meta.env.BASE_URL;

const MAP_MODES = {
  desert: {
    label: "Transit Desert Score",
    panelTitle: "Transit Desert Score",
    description:
      "High need + low access. This combines population density, no-vehicle households, poverty, race/ethnicity, stop access, and route access.",
    legendHigh: "Highest desert score",
    legendMedium: "Moderate desert score",
    legendLow: "Lower desert score",
  },
  access: {
    label: "Transit Access Score",
    panelTitle: "Transit Access Score",
    description:
      "Purely transit service geography. This reflects nearby stops, route coverage, and distance to the nearest non-Park & Ride METRO stop.",
    legendHigh: "Strongest access",
    legendMedium: "Moderate access",
    legendLow: "Lower access",
  },
  need: {
    label: "Transit Need Score",
    panelTitle: "Transit Need Score",
    description:
      "Demographic need. This reflects population density, poverty rate, no-vehicle households, and people of color by census tract.",
    legendHigh: "Highest need",
    legendMedium: "Moderate need",
    legendLow: "Lower need",
  },
};

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

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

function isParkRideText(row) {
  const routeName = `${row.route_short_name || ""} ${row.route_long_name || ""} ${
    row.route_desc || ""
  } ${row.stop_name || ""}`.toLowerCase();

  return (
    routeName.includes("park & ride") ||
    routeName.includes("park and ride") ||
    routeName.includes("park/ride") ||
    routeName.includes("park ride") ||
    routeName.includes("p&r") ||
    routeName.includes("commuter")
  );
}

function getRouteCategory(row) {
  const routeName = `${row.route_short_name || ""} ${row.route_long_name || ""} ${
    row.route_desc || ""
  }`.toLowerCase();

  if (
    routeName.includes("red line") ||
    row.route_short_name === "700" ||
    row.route_id === "700"
  ) {
    return "red-rail";
  }

  if (
    routeName.includes("green line") ||
    row.route_short_name === "800" ||
    row.route_id === "800"
  ) {
    return "green-rail";
  }

  if (
    routeName.includes("purple line") ||
    row.route_short_name === "900" ||
    row.route_id === "900"
  ) {
    return "purple-rail";
  }

  return "local-bus";
}

function getRouteClass(category) {
  if (category === "red-rail") return "desert-route red-rail";
  if (category === "green-rail") return "desert-route green-rail";
  if (category === "purple-rail") return "desert-route purple-rail";
  return "desert-route local-bus";
}

function getScoreColor(score, mode) {
  if (mode === "access") {
    if (score >= 0.78) return "rgba(0, 85, 164, 0.68)";
    if (score >= 0.58) return "rgba(0, 85, 164, 0.42)";
    if (score >= 0.38) return "rgba(0, 85, 164, 0.24)";
    return "rgba(237, 27, 47, 0.16)";
  }

  if (mode === "need") {
    if (score >= 0.78) return "rgba(237, 27, 47, 0.72)";
    if (score >= 0.58) return "rgba(237, 27, 47, 0.46)";
    if (score >= 0.38) return "rgba(242, 140, 40, 0.36)";
    return "rgba(0, 85, 164, 0.08)";
  }

  if (score >= 0.78) return "rgba(237, 27, 47, 0.76)";
  if (score >= 0.58) return "rgba(237, 27, 47, 0.5)";
  if (score >= 0.38) return "rgba(242, 140, 40, 0.38)";
  return "rgba(0, 85, 164, 0.08)";
}

function getScoreForMode(properties, mode) {
  if (mode === "access") return properties.accessScore;
  if (mode === "need") return properties.needScore;
  return properties.desertScore;
}

export default function TransitDesertMap() {
  const svgRef = useRef(null);

  const [mode, setMode] = useState("desert");
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

      const nonParkRideRouteRows = routeRows.filter((row) => !isParkRideText(row));

      const groupedRoutes = d3.group(nonParkRideRouteRows, (d) => d.route_id);

      const routeFeatures = Array.from(groupedRoutes, ([routeId, rows]) => {
        const first = rows[0];
        const category = getRouteCategory(first);

        const coordinates = rows
          .filter((_, index) => index % 8 === 0)
          .map((row) => [Number(row.shape_pt_lon), Number(row.shape_pt_lat)])
          .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));

        const analysisCoordinates = rows
          .filter((_, index) => index % 28 === 0)
          .map((row) => [Number(row.shape_pt_lon), Number(row.shape_pt_lat)])
          .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));

        return {
          routeId,
          name: first.route_short_name || routeId,
          longName: first.route_long_name || "",
          category,
          coordinates,
          analysisCoordinates,
        };
      }).filter((route) => route.coordinates.length > 1);

      const nonParkRideStops = stopRows.filter((row) => !isParkRideText(row));

      const stopFeatures = nonParkRideStops
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

          const centroid = [Number(props.INTPTLON), Number(props.INTPTLAT)];

          const landSqMiles = safeNumber(props.ALAND) / 2589988.11;
          const population = safeNumber(props.population);
          const density = landSqMiles > 0 ? population / landSqMiles : 0;

          const povertyRate = clamp01(safeNumber(props.poverty_rate));
          const noVehicleRate = clamp01(safeNumber(props.no_vehicle_rate));
          const peopleOfColorRate = clamp01(
            safeNumber(props.people_of_color_rate)
          );

          let nearestStopMiles = Infinity;
          let stopsWithinHalfMile = 0;
          let stopsWithinOneMile = 0;

          for (const stop of stopCoordinates) {
            const distance = milesBetween(centroid, stop);

            if (distance < nearestStopMiles) nearestStopMiles = distance;
            if (distance <= 0.5) stopsWithinHalfMile += 1;
            if (distance <= 1) stopsWithinOneMile += 1;
          }

          let routeAccessCount = 0;

          for (const route of routeFeatures) {
            const hasNearbyPoint = route.analysisCoordinates.some(
              (coordinate) => milesBetween(centroid, coordinate) <= 0.75
            );

            if (hasNearbyPoint) routeAccessCount += 1;
          }

          return {
            ...feature,
            properties: {
              ...props,
              centroid,
              population,
              density,
              povertyRate,
              noVehicleRate,
              peopleOfColorRate,
              nearestStopMiles,
              stopsWithinHalfMile,
              stopsWithinOneMile,
              routeAccessCount,
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

      const stopCounts = enrichedTracts.features
        .map((feature) => feature.properties.stopsWithinHalfMile)
        .filter(Number.isFinite);

      const routeCounts = enrichedTracts.features
        .map((feature) => feature.properties.routeAccessCount)
        .filter(Number.isFinite);

      const rawNeedScores = enrichedTracts.features.map((feature) => {
        const props = feature.properties;

        const densityScale = d3
          .scaleLinear()
          .domain(d3.extent(densities))
          .range([0, 1]);

        return (
          clamp01(densityScale(props.density)) * 0.3 +
          props.noVehicleRate * 0.3 +
          props.povertyRate * 0.2 +
          props.peopleOfColorRate * 0.2
        );
      });

      const rawAccessScores = enrichedTracts.features.map((feature) => {
        const props = feature.properties;

        const distanceScale = d3
          .scaleLinear()
          .domain(d3.extent(distances))
          .range([0, 1]);

        const stopDensityScale = d3
          .scaleLinear()
          .domain(d3.extent(stopCounts))
          .range([0, 1]);

        const routeAccessScale = d3
          .scaleLinear()
          .domain(d3.extent(routeCounts))
          .range([0, 1]);

        const stopDensityScore = clamp01(
          stopDensityScale(props.stopsWithinHalfMile)
        );

        const routeCoverageScore = clamp01(
          routeAccessScale(props.routeAccessCount)
        );

        const nearestStopAccessScore = 1 - clamp01(distanceScale(props.nearestStopMiles));

        return (
          stopDensityScore * 0.35 +
          routeCoverageScore * 0.35 +
          nearestStopAccessScore * 0.3
        );
      });

      const rawGapScores = rawNeedScores.map(
        (needScore, index) => needScore - rawAccessScores[index]
      );

      const gapScale = d3
        .scaleLinear()
        .domain(d3.extent(rawGapScores))
        .range([0, 1]);

      enrichedTracts.features = enrichedTracts.features.map((feature, index) => {
        const needScore = clamp01(rawNeedScores[index]);
        const accessScore = clamp01(rawAccessScores[index]);
        const rawGapScore = rawGapScores[index];
        const desertScore = clamp01(gapScale(rawGapScore));

        return {
          ...feature,
          properties: {
            ...feature.properties,
            needScore,
            accessScore,
            rawGapScore,
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
      (a, b) =>
        getScoreForMode(b.properties, mode) - getScoreForMode(a.properties, mode)
    );

    const top = ranked[0]?.properties;

    const avgDistance = d3.mean(
      tracts.features,
      (feature) => feature.properties.nearestStopMiles
    );

    const avgNoVehicle = d3.mean(
      tracts.features,
      (feature) => feature.properties.noVehicleRate
    );

    const avgPoverty = d3.mean(
      tracts.features,
      (feature) => feature.properties.povertyRate
    );

    return {
      tracts: tracts.features.length,
      topName: top?.NAMELSAD || "Highest-scoring tract",
      topScore: getScoreForMode(top || {}, mode) || 0,
      topPopulation: top?.population || 0,
      topDensity: top?.density || 0,
      avgDistance: avgDistance || 0,
      avgNoVehicle: avgNoVehicle || 0,
      avgPoverty: avgPoverty || 0,
    };
  }, [tracts, mode]);

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
      .attr("fill", (feature) =>
        getScoreColor(getScoreForMode(feature.properties, mode), mode)
      )
      .attr("stroke", "rgba(7, 27, 51, 0.18)")
      .attr("stroke-width", 0.55)
      .on("mousemove", (event, feature) => {
        const props = feature.properties;

        setTooltip({
          x: event.offsetX,
          y: event.offsetY,
          title: props.NAMELSAD,
          body:
            `${props.population.toLocaleString()} people • ` +
            `${Math.round(props.density).toLocaleString()} people/sq mi • ` +
            `${(props.noVehicleRate * 100).toFixed(1)}% no-vehicle households • ` +
            `${(props.povertyRate * 100).toFixed(1)}% poverty • ` +
            `${props.nearestStopMiles.toFixed(2)} mi to nearest stop`,
        });
      })
      .on("mouseleave", () => setTooltip(null))
      .on("click", (_, feature) => setSelectedTract(feature.properties));

    g.append("g")
      .attr("class", "desert-route-layer")
      .selectAll("path")
      .data(routes)
      .join("path")
      .attr("class", (route) => getRouteClass(route.category))
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
      .data(stops.filter((_, index) => index % 4 === 0))
      .join("circle")
      .attr("class", "desert-stop")
      .attr("cx", (stop) => projection(stop.coordinates)?.[0])
      .attr("cy", (stop) => projection(stop.coordinates)?.[1])
      .attr("r", 1.25);

    const zoom = d3.zoom().scaleExtent([1, 10]).on("zoom", (event) => {
      const k = event.transform.k;
      g.attr("transform", event.transform);

      g.selectAll(".desert-route").attr(
        "stroke-width",
        Math.max(0.7, 1.75 / Math.sqrt(k))
      );

      g.selectAll(".desert-stop").attr("r", Math.max(0.55, 1.25 / Math.sqrt(k)));

      g.selectAll(".desert-tract").attr(
        "stroke-width",
        Math.max(0.25, 0.55 / Math.sqrt(k))
      );
    });

    svg.call(zoom);
  }, [tracts, routes, stops, mode]);

  const activeMode = MAP_MODES[mode];

  return (
    <div className="transit-desert-map">
      <aside className="desert-insights">
        <p className="desert-panel-label">Key Insights</p>

        <h3>{activeMode.panelTitle}</h3>

        <p>{activeMode.description}</p>

        <div className="desert-mode-buttons" aria-label="Map score mode">
          <button
            type="button"
            className={mode === "desert" ? "active" : ""}
            onClick={() => setMode("desert")}
          >
            Desert
          </button>

          <button
            type="button"
            className={mode === "access" ? "active" : ""}
            onClick={() => setMode("access")}
          >
            Access
          </button>

          <button
            type="button"
            className={mode === "need" ? "active" : ""}
            onClick={() => setMode("need")}
          >
            Need
          </button>
        </div>

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
              <strong>{(insights.avgNoVehicle * 100).toFixed(1)}%</strong>
              <span>Average no-vehicle household rate</span>
            </div>

            <div>
              <strong>{insights.topPopulation.toLocaleString()}</strong>
              <span>Population in highest-scoring tract</span>
            </div>
          </div>
        )}

        <div className="desert-legend">
          <span>
            <i className="high"></i> {activeMode.legendHigh}
          </span>
          <span>
            <i className="medium"></i> {activeMode.legendMedium}
          </span>
          <span>
            <i className="low"></i> {activeMode.legendLow}
          </span>
          <span>
            <i className="route local-bus"></i> Local bus route
          </span>
          <span>
            <i className="route red-rail"></i> Red rail
          </span>
          <span>
            <i className="route green-rail"></i> Green rail
          </span>
          <span>
            <i className="route purple-rail"></i> Purple rail
          </span>
          <span>
            <i className="stop"></i> Sampled stop
          </span>
        </div>
      </aside>

      <div className="desert-map-stage">
        <div className="desert-map-mode-pill">{activeMode.label}</div>

        <svg
          ref={svgRef}
          viewBox="0 0 1200 620"
          role="img"
          aria-label={`${activeMode.label} map of Harris County`}
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
            <span>
              {Math.round(selectedTract.density).toLocaleString()} people/sq mi
            </span>
            <span>
              {(selectedTract.noVehicleRate * 100).toFixed(1)}% no-vehicle
              households
            </span>
            <span>{(selectedTract.povertyRate * 100).toFixed(1)}% poverty</span>
            <span>
              {(selectedTract.peopleOfColorRate * 100).toFixed(1)}% people of
              color
            </span>
            <span>{selectedTract.nearestStopMiles.toFixed(2)} mi to nearest stop</span>
          </div>
        )}
      </div>
    </div>
  );
}