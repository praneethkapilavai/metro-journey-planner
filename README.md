# 🚇 Hyderabad Metro Journey Planner

Plan your ride across Hyderabad's metro network — get the shortest route, live fare estimate, travel time, and a full step-by-step station breakdown, all in one clean interface.

Built with the MERN stack: **MongoDB · Express · React · Node.js**

---

## Features

- **Shortest route** between any two stations using Dijkstra's algorithm
- **Step-by-step journey** with every stop listed and interchange stations flagged
- **Fare, distance & time** calculated instantly
- Covers all three lines — Blue, Red, and Green
- Responsive UI that works on mobile and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Forms | React Hook Form |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/metro-mern.git
cd metro-mern

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Setup

```bash
cd server
cp .env.example .env
```

Open `.env` and set your MongoDB connection string:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/metro_journey_planner
```

For MongoDB Atlas, use your Atlas connection string instead.

### Seed the Database

```bash
cd server
npm run seed
```

Loads all 57 stations and edges into MongoDB. Only needs to be run once.

### Run the App

Open two terminals:

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Visit **http://localhost:3000**

---

## API Reference

### `GET /api/stations`

Returns all stations grouped by line.

```json
{
  "stations": {
    "Blue": ["Nagole", "Uppal", "..."],
    "Red": ["Miyapur", "JNTU College", "..."],
    "Green": ["JBS Parade Ground", "..."]
  }
}
```

### `POST /api/route`

Finds the shortest path between two stations.

**Body:**
```json
{
  "source": "Ameerpet",
  "destination": "LB Nagar"
}
```

**Response:**
```json
{
  "source": "Ameerpet",
  "destination": "LB Nagar",
  "distance": "8.8 KM",
  "time": "16 Min",
  "fare": "₹30",
  "interchanges": 0,
  "stops": 10,
  "path": [
    { "key": "Ameerpet~BR", "name": "Ameerpet", "lines": ["Blue", "Red"] }
  ]
}
```

---

## Metro Network

| Line | From | To | Stations |
|---|---|---|---|
| 🔵 Blue | Nagole | Raidurg | 23 |
| 🔴 Red | Miyapur | LB Nagar | 27 |
| 🟢 Green | JBS Parade Ground | MG Bus Station | 10 |

Interchange stations: **Ameerpet** (Blue ↔ Red), **Parade Ground** (Blue ↔ Green), **MG Bus Station** (Red ↔ Green)

---

## Project Structure

```
metro-mern/
├── server/
│   ├── src/
│   │   ├── config/        # MongoDB connection
│   │   ├── models/        # Station & Edge schemas
│   │   ├── graph/         # Dijkstra engine
│   │   ├── controllers/   # Route logic
│   │   ├── routes/        # API endpoints
│   │   └── scripts/       # Seed script + CSV data
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/    # MetroPlanner UI
    │   ├── hooks/         # useStations data hook
    │   └── assets/        # Logo & route map
    └── package.json
```

---

## License

MIT