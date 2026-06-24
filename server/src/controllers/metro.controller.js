import Station from "../models/Station.js";
import Edge from "../models/Edge.js";
import Graph from "../graph/Graph.js";

// Build graph once and cache it
let cachedGraph = null;

async function getGraph() {
  if (cachedGraph) return cachedGraph;
  const stations = await Station.find({});
  const edges = await Edge.find({});
  const g = new Graph();
  g.loadFromData(stations, edges);
  cachedGraph = g;
  return g;
}

// GET /api/stations
export const getStations = async (req, res) => {
  try {
    const stations = await Station.find({}).sort({ name: 1 });
    const grouped = { Blue: [], Red: [], Green: [] };
    for (const s of stations) {
      for (const line of s.lines) {
        if (grouped[line]) grouped[line].push(s.name);
      }
    }
    res.json({ stations: grouped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/route
export const getRoute = async (req, res) => {
  try {
    const { source, destination } = req.body;
    if (!source || !destination) {
      return res.status(400).json({ error: "source and destination are required" });
    }

    const g = await getGraph();
    const allKeys = Object.keys(g.vtces);

    // Match station name → full key (e.g. "Ameerpet" → "Ameerpet~BR")
    const srcKey = allKeys.find((k) => k.startsWith(source + "~") || k === source);
    const dstKey = allKeys.find((k) => k.startsWith(destination + "~") || k === destination);

    if (!srcKey) return res.status(404).json({ error: `Station not found: ${source}` });
    if (!dstKey) return res.status(404).json({ error: `Station not found: ${destination}` });
    if (srcKey === dstKey) return res.status(400).json({ error: "Source and destination are the same" });

    const result = g.dijkstra(srcKey, dstKey);
    if (!result) return res.status(404).json({ error: "No route found" });

    const { path, distance } = result;
    const interchanges = g.countInterchanges(path);

    // Annotate each step with line info
    const LINE_MAP = { B: "Blue", R: "Red", G: "Green" };
    const steps = path.map((key) => {
      const name = key.split("~")[0];
      const code = key.slice(key.indexOf("~") + 1);
      const lines = [...code].map((c) => LINE_MAP[c]).filter(Boolean);
      return { key, name, lines };
    });

    res.json({
      source: srcKey.split("~")[0],
      destination: dstKey.split("~")[0],
      distance: `${distance} KM`,
      time: Graph.travelTime(distance),
      fare: `₹${Graph.fare(distance)}`,
      interchanges,
      stops: steps.length - 1,
      path: steps,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
