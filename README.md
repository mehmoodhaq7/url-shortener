# URL Shortener — Blue-Green Deployment

A production-grade URL shortener built to demonstrate blue-green deployment
strategy with zero-downtime releases, CI/CD automation, and full observability.

## Stack

- **Frontend:** React 18
- **Backend:** Node.js + Express
- **Database:** MongoDB (shared, persistent)
- **Cache:** Redis (per-stack)
- **Proxy:** Nginx (traffic switcher)
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana + cAdvisor

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Blue-Green Deployment

See [docs/BLUE_GREEN.md](docs/BLUE_GREEN.md)

## Quick Start

```bash
cp .env.example .env.blue
cp .env.example .env.green
docker compose -f docker-compose.blue.yml up -d
```

## Project Structure

```
url-shortener-blue-green/
├── frontend/          # React app
├── backend/           # Node.js Express API
├── nginx/             # Reverse proxy + traffic switcher
├── monitoring/        # Prometheus + Grafana
├── scripts/           # switch.sh, health-check.sh
├── docs/              # Architecture and deployment docs
└── .github/workflows/ # CI/CD pipeline
```
