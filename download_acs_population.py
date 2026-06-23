import json
import urllib.parse
import urllib.request

API_KEY = "11985ad46b08cbefe1768167f86eb44ad774b84a"
YEAR = 2022

base_url = f"https://api.census.gov/data/{YEAR}/acs/acs5"

params = {
    "get": "NAME,B01003_001E",
    "for": "tract:*",
    "in": "state:48 county:201",
    "key": API_KEY,
}

url = base_url + "?" + urllib.parse.urlencode(params)

with urllib.request.urlopen(url) as response:
    rows = json.loads(response.read().decode("utf-8"))

headers = rows[0]
data = rows[1:]

population_by_geoid = {}

for row in data:
    item = dict(zip(headers, row))
    geoid = item["state"] + item["county"] + item["tract"]
    population_by_geoid[geoid] = int(item["B01003_001E"])

with open("website/public/data/harris_tracts.geojson") as f:
    geojson = json.load(f)

matched = 0

for feature in geojson["features"]:
    geoid = feature["properties"]["GEOID"]

    population = population_by_geoid.get(geoid, 0)
    feature["properties"]["population"] = population

    if population > 0:
        matched += 1

with open(
    "website/public/data/harris_tracts_with_population.geojson",
    "w"
) as f:
    json.dump(geojson, f)

print(
    f"Created file with population for "
    f"{matched}/{len(geojson['features'])} tracts"
)
