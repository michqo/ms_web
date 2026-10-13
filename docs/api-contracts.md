# Verified weather API contracts

Verified against the sibling `ms_api` source, PostgreSQL migrations, and its
`tests/test_weather_contracts.py` API tests on 2026-10-11.

## Observations and stations

`GET /api/stations/` is public and paginated (default 10). With a JWT it lists
only that user's stations. The frontend retrieves all pages, up to 100, and
checks completeness. API ordering is stable by ID. Station create/edit/delete
requires authentication and ownership; the creator is always the request user.
Zero latitude/longitude is valid. Optional city lookup has a five-second timeout
and does not prevent saving a station when the provider is unavailable.

`GET /api/measurements/latest/?station=ID` returns JSON with an ISO timestamp,
float temperature (°C), float humidity (%), and an ID. The deployed model removed
pressure/rain/wind fields in migration 0016; absent sensors remain unavailable.
404 means missing station or no readings. Other failures remain errors.

## Daily history

`GET /api/measurements/stats/` requires `station`, `timestamp__gt`, and
`timestamp__lt`. Despite the parameter names, the endpoint accepts **inclusive
YYYY-MM-DD dates**, at most seven days apart. It uses the backend UTC timezone.
The frontend composes nonoverlapping seven-calendar-day chunks for larger ranges,
bounded to 366 days. Results are daily arithmetic averages, not raw minima/maxima
or weighted averages across the whole range. The summary explicitly says mean
of daily averages. Past days need at least two readings; today needs one.
A successful empty response stays empty.

`GET /api/measurements/?station=ID&timestamp_date=YYYY-MM-DD` uses inclusive UTC
calendar-day bounds. `page_size` is capped at **30**. API ordering is descending
by timestamp then ID. The frontend reads up to **50 pages / 1,500 readings**, checks
that count is stable and every page is present, rejects duplicate IDs, then sorts
ascending for the chart. Larger/changing days fail explicitly instead of showing
a partial chart. The detail table paginates the complete series locally.

Deletion uses the selected station and strict ISO timestamp bounds expanded by
one millisecond around the inclusive UTC dates. The API rejects missing or
foreign station IDs. It removes derived statistic caches for that owned station;
subsequent history queries recompute them. Every weather cache key in the current
session/data mode is invalidated after mutation.

## Forecast and authentication

The ForecastViewSet PermissionMixin allows public list access (the previous README
incorrectly said JWT was required). Parallel arrays must have matching lengths and
finite values before rendering. Forecast dates remain provider calendar dates;
modelrun_utc and created_at are separate UTC metadata. Weather forecasts use
[meteoblue's specified m/s wind units](https://my.meteoblue.com/packages/openapi.json); observations never borrow forecast values.
Provider credentials are optional for local observations; absent/offline forecast
providers return 503. Cached forecasts remain available without contacting the provider.

JWT validation uses an explicit token per request. WeatherApi instances never share
an Authorization header. Refresh-only sessions recover; rejected credentials clear
cookies, while transient failures preserve them and show account recovery copy.
Demo routes bypass auth/network and reject all mutations.

## External configuration

Real meteoblue and Google/GitHub flows need credentials in the API's ignored `.env`.
The local database starts empty; tests create disposable fixtures in Django's test
database. `/demo` uses independent frontend samples. The explicit local-only
`seed_weather` command can add two labeled Local test stations with 30 UTC days
of synthetic readings to PostgreSQL. `verify_weather_api` compares actual HTTP
responses with those rows and removes its temporary mutation fixtures afterwards.
Neither command runs during frontend builds or production deployment.
