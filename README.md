<div align="center">
  <img src="static/favicon.png" alt="Weather Station Logo" width="100" />
  <h1>Weather Station System</h1>
</div>

This project is a complete IoT weather station monitoring system, featuring a robust backend API, a modern web-based frontend dashboard, and ESP32 hardware clients for data collection.

## Project Description

The system enables real-time monitoring of weather conditions from various custom-built weather stations. Each station uses an ESP32 microcontroller to collect environmental data (temperature, humidity, pressure, etc.) and transmits it via HTTP to a central Django API. The SvelteKit-powered frontend provides a comprehensive interface for users to view live data, historical measurements, and forecasts.

## Key Features

- **Real-time Monitoring**: Instant updates of latest weather conditions.
- **Interactive Charts**: Historical data visualization using LayerChart.
- **Detailed Forecasts**: Multi-day weather forecasts for each station.
- **Station Management**: Interface to add, edit, and track multiple weather terminals.
- **Multi-language Support**: Full internalization (i18n) for different locales.
- **Hardware Integration**: Custom ESP32 implementation for reliable field data collection.

## Screenshots

<div align="center">
  <img src=".github/assets/homepage.png" alt="Homepage" width="45%" style="border-radius: 8px; margin: 5px;" />
  <img src=".github/assets/dashboard.png" alt="Dashboard" width="45%" style="border-radius: 8px; margin: 5px;" />
  <br />
  <img src=".github/assets/measurements.png" alt="Measurements" width="45%" style="border-radius: 8px; margin: 5px;" />
  <img src=".github/assets/forecast.png" alt="Forecast" width="45%" style="border-radius: 8px; margin: 5px;" />
</div>

## Tech Stack

### Frontend

- **Framework**: [SvelteKit](https://kit.svelte.dev/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Bits UI](https://bits-ui.com/) & [shadcn (Svelte)](https://shadcn-svelte.com/)
- **Visualization**: [LayerChart](https://www.layerchart.com/)
- **Form Handling**: Superforms & Zod

### Backend

- **Framework**: [Django](https://www.djangoproject.com/)
- **API**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)

### Hardware

- **Micocontroller**: [ESP32](https://www.espressif.com/en/products/socs/esp32)
- **Communication**: HTTP REST requests for data transmission

## Setup & Development

### Prerequisities

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v10+)
- Python 3.x
- PostgreSQL

### Frontend Installation

```bash
# Clone the repository
cd ms-web

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Backend Installation

```bash
# Navigate to API directory
cd ms-api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install requirements
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```
