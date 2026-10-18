
# ASTRIX | Satellite Anomaly Detection

An AI-driven satellite monitoring platform designed to identify anomalous telemetry patterns and support satellite anomaly analysis through an interactive web dashboard.

<p align="center">
  <strong>Live Demo</strong><br>
  <a href="https://astrix-frontend-7rvr.onrender.com">Launch ASTRIX Dashboard</a>
</p>

---

## Overview

As satellite constellations grow, monitoring telemetry and identifying abnormal behavior becomes increasingly complex. Manual anomaly investigation can delay responses and increase operational risk.

**ASTRIX** aims to streamline satellite monitoring by combining a web-based dashboard with a backend API for telemetry and anomaly-related operations.

## Key Features

- **Satellite Monitoring Dashboard** — View monitoring information through a centralized interface.
- **Anomaly Analysis** — Access anomaly-related information and investigation functionality.
- **Telemetry Visualization** — Explore telemetry data through the dashboard where supported by the implementation.
- **API Integration** — Connect the frontend to a FastAPI backend.
- **Containerized Deployment** — Package the application using Docker.
- **Cloud Hosting** — Access the deployed frontend through Render.

## System Architecture

```text
                 User
                  |
                  v
          Next.js Web Dashboard
                  |
             HTTP / API
                  |
                  v
             FastAPI Backend
                  |
                  v
       Telemetry and Anomaly Logic
```

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Python, FastAPI |
| Containerization | Docker, Docker Compose |
| Deployment | Render |
| Version Control | Git, GitHub |

## Getting Started

### Prerequisites

- Git
- Docker Desktop
- Docker Compose

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/shivamani2024/ASTRIX-Satellite-Anomaly-Detection.git
```

**2. Navigate to the project directory**

```bash
cd ASTRIX-Satellite-Anomaly-Detection
```

**3. Build and start the application**

```bash
docker compose up --build
```

**4. Access the application locally**

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

To stop the containers, run:

```bash
docker compose down
```

## Project Structure

```text
ASTRIX/
├── backend/       # FastAPI backend
├── frontend/      # Next.js frontend
├── docker-compose.yml
└── README.md
```

*The structure above is illustrative; actual filenames may vary.*

## Project Goals

- Reduce reliance on manual satellite telemetry monitoring.
- Support earlier identification of potentially abnormal behavior.
- Provide an accessible interface for anomaly investigation.
- Establish a foundation for future intelligent diagnosis and recovery workflows.

## Future Enhancements

- Expand anomaly detection evaluation using relevant satellite telemetry datasets.
- Improve anomaly explanations and diagnostic insights.
- Explore AI-agent-assisted recovery recommendations.
- Add mission-constraint validation and digital-twin simulation where feasible.
- Strengthen automated testing, monitoring, and auditability.

## Limitations

The capabilities of anomaly detection depend on the implemented models, available telemetry data, and evaluation results. This project is intended for demonstration and development; it is not a validated operational system for controlling real satellites.

## Author

**Shivamani Rao**

GitHub: [@shivamani2024](https://github.com/shivamani2024)

---

If you find this project interesting, explore the live demo and follow the repository for future improvements.
