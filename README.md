# Bangla Weather Brief

A professional, corporate-style Flutter weather app focused on Bangladesh with Bangla-first content and a live Open-Meteo data source.

## Highlights

- Corporate dashboard UI with executive summary, KPI cards, and forecast panels
- Bangla language labels and Bangla numeral formatting across the experience
- Bangladesh city quick picks plus searchable live weather lookup
- No API key required for the default live weather experience
- Cross-platform Flutter scaffold for Android, iOS, web, desktop, and tests

## Tech Stack

- Flutter with Material 3
- Open-Meteo forecast and geocoding APIs
- `http` for network requests

## Run locally

```bash
flutter pub get
flutter run
```

## Test

```bash
flutter analyze
flutter test
```

## Product Notes

- The app defaults to Dhaka and provides quick access to major Bangladesh cities.
- Search works best with familiar English city names for live geocoding, while the interface remains Bangla-first.
- Forecast messaging is styled for a professional audience with operational planning guidance.
