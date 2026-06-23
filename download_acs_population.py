import json
import urllib.parse
import urllib.request

API_KEY = "11985ad46b08cbefe1768167f86eb44ad774b84a"
YEAR = 2022

base_url = f"https://api.census.gov/data/{YEAR}/acs/acs5"

variables = {
    "population": "B01003_001E",
    "poverty_total": "B17001_001E",
    "poverty_count": "B17001_002E",
    "households_vehicle_total": "B08201_001E",
    "households_no_vehicle": "B08201_002E",
    "race_total": "B03002_001E",
    "white_non_hispanic": "B03002_003E",
    "black_non_hispanic": "B03002_004E",
    "asian_non_hispanic": "B03002_006E",
    "hispanic_or_latino": "B03002_012E",
}

params = {
    "get": "NAME," + ",".join(variables.values()),
    "for": "tract:*",
    "in": "state:48 county:201",
    "key": API_KEY,
}

url = base_url + "?" + urllib.parse.urlencode(params)

print("Requesting ACS data...")

with urllib.request.urlopen(url) as response:
    rows = json.loads(response.read().decode("utf-8"))

headers = rows[0]
data = rows[1:]

acs_by_geoid = {}

def safe_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0

def safe_rate(numerator, denominator):
    if denominator <= 0:
        return 0
    return numerator / denominator

for row in data:
    item = dict(zip(headers, row))
    geoid = item["state"] + item["county"] + item["tract"]

    record = {"name": item["NAME"]}

    for friendly_name, census_var in variables.items():
        record[friendly_name] = safe_int(item.get(census_var))

    record["poverty_rate"] = safe_rate(
        record["poverty_count"],
        record["poverty_total"],
    )

    record["no_vehicle_rate"] = safe_rate(
        record["households_no_vehicle"],
        record["households_vehicle_total"],
    )

    record["white_non_hispanic_rate"] = safe_rate(
        record["white_non_hispanic"],
        record["race_total"],
    )

    record["black_non_hispanic_rate"] = safe_rate(
        record["black_non_hispanic"],
        record["race_total"],
    )

    record["asian_non_hispanic_rate"] = safe_rate(
        record["asian_non_hispanic"],
        record["race_total"],
    )

    record["hispanic_or_latino_rate"] = safe_rate(
        record["hispanic_or_latino"],
        record["race_total"],
    )

    record["people_of_color"] = (
        record["race_total"] - record["white_non_hispanic"]
    )

    record["people_of_color_rate"] = safe_rate(
        record["people_of_color"],
        record["race_total"],
    )

    acs_by_geoid[geoid] = record

with open("website/public/data/harris_tracts.geojson") as f:
    geojson = json.load(f)

matched = 0

for feature in geojson["features"]:
    geoid = feature["properties"]["GEOID"]
    acs_record = acs_by_geoid.get(geoid)

    if acs_record:
        matched += 1
        feature["properties"].update(acs_record)
    else:
        feature["properties"].update({
            "population": 0,
            "poverty_rate": 0,
            "no_vehicle_rate": 0,
            "people_of_color_rate": 0,
        })

output_path = "website/public/data/harris_tracts_with_population.geojson"

with open(output_path, "w") as f:
    json.dump(geojson, f)

print(f"Created {output_path}")
print(f"Matched ACS data for {matched}/{len(geojson['features'])} tracts")