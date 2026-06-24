import { useState, useEffect } from "react";

export interface StationGroups {
  Blue: string[];
  Red: string[];
  Green: string[];
}

export function useStations() {
  const [stations, setStations] = useState<StationGroups>({ Blue: [], Red: [], Green: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stations")
      .then((r) => r.json())
      .then((data) => {
        setStations(data.stations);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { stations, loading, error };
}
