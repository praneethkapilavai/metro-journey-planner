import express from "express";
import { getStations, getRoute } from "../controllers/metro.controller.js";

const router = express.Router();

router.get("/stations", getStations);
router.post("/route", getRoute);

export default router;
