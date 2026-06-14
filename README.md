# Houston Transit Investment Analysis

## Overview

This project analyzes Houston METRO bus service performance using GTFS transit data, Census demographic data, and route-level ridership statistics to identify corridors that may benefit from future transit investment.

The analysis combines service frequency, weekday ridership, route geography, and population density to create an investment prioritization framework for major METRO bus routes.

---

## Research Question

Which Houston METRO bus corridors demonstrate the strongest potential for future transit investment based on ridership demand, service productivity, and geographic context?

---

## Data Sources

### METRO GTFS Data

* Houston METRO General Transit Feed Specification (GTFS)
* Routes
* Trips
* Shapes
* Stops

### METRO Ridership Data

* Average weekday boardings by route

### U.S. Census Bureau

* 2023 American Community Survey (ACS)
* TIGER/Line Census Tracts
* Harris County demographic and geographic data

---

## Tools Used

* Python
* Pandas
* GeoPandas
* Matplotlib
* Jupyter Notebook
* Git
* GitHub

---

## Methodology

### 1. Route Ridership Analysis

Calculated average weekday boardings for major METRO routes.

### 2. Service Frequency Analysis

Used GTFS trip schedules to estimate the number of scheduled trips per route.

### 3. Route Productivity

Computed riders per scheduled trip:

Riders per Trip = Average Weekday Boardings / Scheduled Trips

### 4. Geographic Analysis

Mapped route geometries using GTFS shape data.

### 5. Population Density Analysis

Mapped Harris County census tract population density and compared route alignments with high-density areas.

### 6. Investment Priority Score

Created a composite metric using:

* Ridership demand
* Service frequency
* Route productivity

---

## Key Findings

### Westheimer

* Highest weekday ridership among analyzed routes
* Strong overall investment candidate
* Serves several dense urban corridors

### Beechnut

* Highest riders-per-trip ratio
* Indicates strong utilization relative to service provided

### Gessner

* Important north-south connector
* Intersects multiple major east-west routes

### Richmond and Bellaire

* Continue to serve significant ridership demand
* Lower productivity metrics compared with Westheimer and Beechnut

### Population Density

Major high-ridership routes generally overlap with some of Harris County's most densely populated census tracts, supporting future investment along these corridors.

---

## Results

### Investment Priority Ranking

| Route      | Relative Priority |
| ---------- | ----------------- |
| Westheimer | Highest           |
| Beechnut   | High              |
| Gessner    | High              |
| Richmond   | Moderate          |
| Bellaire   | Moderate          |

---

## Conclusion

This analysis suggests that Westheimer, Beechnut, and Gessner are strong candidates for future transit investment due to their combination of high ridership demand, service productivity, and alignment with dense population centers.

Future work could expand the analysis to all METRO routes, incorporate additional demographic variables, and evaluate equity-focused investment strategies.

---

## Author

Leif Blake

B.S. Computer Graphics Technology – Web Programming and Design

Purdue University

## Visualizations

### Population Density and Major Routes

![Population Density Map](visuals/population_density_routes.png)

### Investment Priority Ranking

![Investment Priority](visuals/investment_priority_score.png)