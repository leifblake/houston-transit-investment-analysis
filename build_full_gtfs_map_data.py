import pandas as pd
from pathlib import Path

root = Path("data/raw/metro_gtfs/merged")
out = Path("website/public/data")
out.mkdir(parents=True, exist_ok=True)

routes = pd.read_csv(root / "routes.txt")
trips = pd.read_csv(root / "trips.txt")
shapes = pd.read_csv(root / "shapes.txt")
stops = pd.read_csv(root / "stops.txt")
stop_times = pd.read_csv(root / "stop_times.txt", usecols=["trip_id", "stop_id"])

route_shapes = (
    trips[["route_id", "shape_id"]]
    .drop_duplicates()
    .merge(routes, on="route_id", how="left")
    .merge(shapes, on="shape_id", how="left")
    .sort_values(["route_id", "shape_id", "shape_pt_sequence"])
)

route_shapes.to_csv(out / "all_route_geometry.csv", index=False)

stop_routes = (
    stop_times
    .merge(trips[["trip_id", "route_id"]], on="trip_id", how="left")
    .merge(routes[["route_id", "route_short_name", "route_long_name", "route_type"]], on="route_id", how="left")
)

stop_summary = (
    stop_routes.groupby("stop_id")
    .agg(
        route_ids=("route_id", lambda x: ",".join(sorted(set(map(str, x.dropna()))))),
        route_names=("route_short_name", lambda x: ",".join(sorted(set(map(str, x.dropna()))))),
        route_types=("route_type", lambda x: ",".join(sorted(set(map(str, x.dropna()))))),
    )
    .reset_index()
)

stops_enriched = stops.merge(stop_summary, on="stop_id", how="left")
stops_enriched.to_csv(out / "stops_enriched.csv", index=False)

print("Created:")
print(out / "all_route_geometry.csv")
print(out / "stops_enriched.csv")