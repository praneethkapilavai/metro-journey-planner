/**
 * seed.js — Parses edges.csv & stations.csv and inserts into MongoDB.
 * Run once: npm run seed
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Station from "../models/Station.js";
import Edge from "../models/Edge.js";

dotenv.config({ path: new URL("../../.env", import.meta.url).pathname });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LINE_MAP = { B: "Blue", R: "Red", G: "Green" };

function parseLineCode(key) {
  const code = key.slice(key.indexOf("~") + 1);
  return [...code].map((c) => LINE_MAP[c]).filter(Boolean);
}

function parseName(key) {
  return key.split("~")[0].trim();
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  await Station.deleteMany({});
  await Edge.deleteMany({});

  // --- Parse stations.csv ---
  const stationsPath = path.join(__dirname, "stations.csv");
  const stationKeys = fs
    .readFileSync(stationsPath, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const stationDocs = stationKeys.map((key) => ({
    key,
    name: parseName(key),
    lines: parseLineCode(key),
    interchange: parseLineCode(key).length > 1,
  }));
  await Station.insertMany(stationDocs);
  console.log(`Inserted ${stationDocs.length} stations`);

  // --- Parse edges.csv ---
  const edgesPath = path.join(__dirname, "edges.csv");
  const lines = fs
    .readFileSync(edgesPath, "utf-8")
    .split("\n")
    .map((l) => l.trim());

  const edgeDocs = [];
  const lineNames = ["Blue", "Red", "Green"];
  let currentLine = null;
  let lineIndex = -1;
  let prev = null;

  for (const row of lines) {
    if (row === "" || row === "\t") {
      prev = null;
      currentLine = null;
      continue;
    }
    const parts = row.split(",");
    const stationKey = parts[0].trim();
    const dist = parts[1] ? parseFloat(parts[1]) : null;

    if (dist === null) {
      // This is a line-start station
      lineIndex++;
      currentLine = lineNames[lineIndex];
      prev = stationKey;
      continue;
    }

    if (prev && currentLine) {
      edgeDocs.push({
        from: prev,
        to: stationKey,
        distance: dist,
        line: currentLine,
      });
    }
    prev = stationKey;
  }

  await Edge.insertMany(edgeDocs);
  console.log(`Inserted ${edgeDocs.length} edges`);

  await mongoose.disconnect();
  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
