# FlowVenue

FlowVenue is a Next.js 14 based smart stadium experience platform. The project demonstrates an AI-powered command center logic structure handling attendee egress, crowd distribution, washroom saturation analytics, and predictive inventory mapping.

## Problem Statement Mapping
- **Washroom Intelligence:** Utilizing predictive density and thermal algorithms to reduce average 15-minute half-time wait times down to 3 minutes by dynamically diverting crowds to under-utilized facilities.
- **Companion Tracker:** Eliminating manual wandering by instantly mapping friends using BLE beacons and providing zero-friction meeting point formulations.
- **Egress Command:** Halving the structural exit rate delay via automated gate-release staggering linked natively to live ride-hail surge pricing datasets.
- **Inventory Predictor:** Preventing surprise stockouts uniquely mapped locally via point-of-sale burn velocities.

## Tech Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Aesthetics: Tailwind CSS, Framer Motion
- Analytics: Recharts (D3)

## Quick Start Configuration
```bash
npm install
npm run dev
```
Visit `http://localhost:3000` to interact with the Command Dashboard locally.

## Antigravity Deployment Steps
To seamlessly stage this repository to your target architectural hardware:
```bash
antigravity deploy
```
*(Ensure you have successfully authenticated your active session via `antigravity login` prior to execution of the CI pipeline.)*
