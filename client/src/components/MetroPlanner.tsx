import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useStations } from "../hooks/useStations";
import routeMapImg from "../assets/hydmetroroutemap.jpg";
import logoImg from "../assets/hydmetrologo.jpg";
import "./MetroPlanner.css";

interface FormValues {
  source: string;
  destination: string;
}

interface RouteStep {
  key: string;
  name: string;
  lines: string[];
}

interface RouteResult {
  source: string;
  destination: string;
  distance: string;
  time: string;
  fare: string;
  interchanges: number;
  stops: number;
  path: RouteStep[];
}

const LINE_COLOR: Record<string, string> = {
  Blue: "#0057B8",
  Red: "#E8192C",
  Green: "#00843D",
};

function LineBadge({ line }: { line: string }) {
  return (
    <span
      className="line-badge"
      style={{ background: LINE_COLOR[line] ?? "#666" }}
    >
      {line}
    </span>
  );
}

function StationDot({ lines }: { lines: string[] }) {
  const primary = lines[0];
  return (
    <span
      className="station-dot"
      style={{ borderColor: LINE_COLOR[primary] ?? "#666" }}
    />
  );
}

export default function MetroPlanner() {
  const { stations, loading: stLoading } = useStations();
  const [result, setResult] = useState<RouteResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>();

  const sourceVal = watch("source");

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitting(true);
    setApiError(null);
    setResult(null);
    try {
      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: data.source, destination: data.destination }),
      });
      const json = await res.json();
      if (!res.ok) {
        setApiError(json.error ?? "Something went wrong");
      } else {
        setResult(json);
      }
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const allStations = [...new Set([...stations.Blue, ...stations.Red, ...stations.Green])].sort();

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <img src={logoImg} alt="Hyderabad Metro" className="logo" />
            <div>
              <div className="brand-title">Metro Journey Planner</div>
              <div className="brand-sub">Hyderabad Metro Rail</div>
            </div>
          </div>
          <div className="line-pills">
            <span className="pill pill-blue">Blue Line</span>
            <span className="pill pill-red">Red Line</span>
            <span className="pill pill-green">Green Line</span>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Planner card */}
        <section className="planner-card">
          <h2 className="section-title">Plan Your Journey</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="planner-form" noValidate>
            <div className="form-row">
              {/* Source */}
              <div className="field">
                <label className="field-label">
                  <span className="dot dot-green" />
                  From
                </label>
                <select
                  className={`field-select ${errors.source ? "field-error" : ""}`}
                  defaultValue=""
                  {...register("source", { required: "Select a source station" })}
                >
                  <option value="" disabled>Select source station</option>
                  <optgroup label="─── Blue Line ───">
                    {stations.Blue.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </optgroup>
                  <optgroup label="─── Red Line ───">
                    {stations.Red.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </optgroup>
                  <optgroup label="─── Green Line ───">
                    {stations.Green.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </optgroup>
                </select>
                {errors.source && <p className="error-msg">{errors.source.message}</p>}
              </div>

              <div className="swap-icon">⇄</div>

              {/* Destination */}
              <div className="field">
                <label className="field-label">
                  <span className="dot dot-red" />
                  To
                </label>
                <select
                  className={`field-select ${errors.destination ? "field-error" : ""}`}
                  defaultValue=""
                  {...register("destination", {
                    required: "Select a destination station",
                    validate: (val) => val !== sourceVal || "Source and destination can't be the same",
                  })}
                >
                  <option value="" disabled>Select destination station</option>
                  <optgroup label="─── Blue Line ───">
                    {stations.Blue.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </optgroup>
                  <optgroup label="─── Red Line ───">
                    {stations.Red.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </optgroup>
                  <optgroup label="─── Green Line ───">
                    {stations.Green.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </optgroup>
                </select>
                {errors.destination && <p className="error-msg">{errors.destination.message}</p>}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={submitting || stLoading}>
              {submitting ? "Finding route…" : stLoading ? "Loading stations…" : "Find Shortest Route"}
            </button>
          </form>

          {apiError && <div className="api-error">{apiError}</div>}
        </section>

        {/* Result */}
        {result && (
          <section className="result-section">
            {/* Summary cards */}
            <div className="summary-cards">
              <div className="stat-card">
                <div className="stat-icon">📍</div>
                <div className="stat-value">{result.distance}</div>
                <div className="stat-label">Distance</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏱</div>
                <div className="stat-value">{result.time}</div>
                <div className="stat-label">Est. Time</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎫</div>
                <div className="stat-value">{result.fare}</div>
                <div className="stat-label">Fare</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔄</div>
                <div className="stat-value">{result.interchanges}</div>
                <div className="stat-label">Interchange{result.interchanges !== 1 ? "s" : ""}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🚇</div>
                <div className="stat-value">{result.stops}</div>
                <div className="stat-label">Stops</div>
              </div>
            </div>

            {/* Route path */}
            <div className="route-card">
              <h3 className="route-title">
                {result.source} → {result.destination}
              </h3>
              <div className="route-path">
                {result.path.map((step, i) => {
                  const isFirst = i === 0;
                  const isLast = i === result.path.length - 1;
                  const isInterchange = step.lines.length > 1;
                  return (
                    <div
                      key={step.key}
                      className={`path-step ${isFirst ? "step-first" : ""} ${isLast ? "step-last" : ""} ${isInterchange ? "step-interchange" : ""}`}
                    >
                      <div className="step-left">
                        <StationDot lines={step.lines} />
                        {!isLast && (
                          <div
                            className="step-line"
                            style={{ background: LINE_COLOR[step.lines[0]] ?? "#666" }}
                          />
                        )}
                      </div>
                      <div className="step-right">
                        <span className="step-name">{step.name}</span>
                        <div className="step-badges">
                          {step.lines.map((l) => (
                            <LineBadge key={l} line={l} />
                          ))}
                          {isInterchange && (
                            <span className="interchange-tag">Interchange</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Route map toggle */}
        <section className="map-section">
          <button className="btn-secondary" onClick={() => setShowMap((v) => !v)}>
            {showMap ? "Hide Network Map" : "View Network Map"}
          </button>
          {showMap && (
            <div className="map-container">
              <img src={routeMapImg} alt="Hyderabad Metro Route Map" className="route-map" />
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        Hyderabad Metro Rail · MERN Stack · Data accurate as of 2024
      </footer>
    </div>
  );
}
