import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGovernmentDashboard,
  getGovernmentHealthInsight,
} from "../../services/GovernmentApi";
import GovernmentMap from "./GovernmentMap";
import "./GovernmentDashboard.css";

const INITIAL_FILTERS = {
  state: "",
  district: "",
  disease: "",
  period: "365d",
};
const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

function BarChart({ title, items = [], tone = "blue" }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <section className="chart-card">
      <h3>{title}</h3>
      {items.length ? (
        <div className={`bar-chart ${tone}`}>
          {items.map((item) => (
            <div className="bar-row" key={item.label}>
              <span title={item.label}>{item.label}</span>
              <div className="bar-track">
                <i style={{ width: `${(item.value / max) * 100}%` }} />
              </div>
              <b>{formatNumber(item.value)}</b>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No matching data</p>
      )}
    </section>
  );
}

function TrendChart({ items = [] }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <section className="chart-card trend-card">
      <h3>Monthly consultation trend</h3>
      <div className="trend-bars">
        {items.map((item) => (
          <div className="trend-column" key={item.label}>
            <b>{item.value || ""}</b>
            <i
              style={{
                height: `${Math.max(item.value ? 12 : 2, (item.value / max) * 100)}%`,
              }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function GovernmentDashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  const loadDashboard = async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const response = await getGovernmentDashboard(activeFilters);
      setDashboard(response.data);
    } catch (requestError) {
      if (requestError.response?.status === 401)
        return navigate("/gov/login", { replace: true });
      setError(
        requestError.response?.data?.message ||
          "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);
  const districts = useMemo(
    () => dashboard?.filters?.districtsByState?.[filters.state] || [],
    [dashboard, filters.state],
  );
  const changeFilter = (field, value) => {
    const next = {
      ...filters,
      [field]: value,
      ...(field === "state" ? { district: "" } : {}),
    };
    setFilters(next);
    setInsight("");
    loadDashboard(next);
  };
  const reset = () => {
    setFilters(INITIAL_FILTERS);
    setInsight("");
    loadDashboard(INITIAL_FILTERS);
  };
  const createInsight = async () => {
    try {
      setInsightLoading(true);
      const response = await getGovernmentHealthInsight(filters);
      setInsight(response.data.insight);
    } catch {
      setInsight(
        "AI insight is temporarily unavailable. Please review the charts and alerts.",
      );
    } finally {
      setInsightLoading(false);
    }
  };
  const signOut = () => {
    localStorage.removeItem("govToken");
    navigate("/gov/login", { replace: true });
  };
  const summary = dashboard?.summary || {};
  const cards = [
    ["Total Patients", summary.totalPatients, "people"],
    ["Total Doctors", summary.totalDoctors, "clinicians"],
    ["Total Consultations", summary.totalConsultations, "consultations"],
    ["Cases This Week", summary.casesThisWeek, "week"],
    ["Cases This Month", summary.casesThisMonth, "month"],
    ["Cases This Year", summary.casesThisYear, "year"],
    ["Top Disease", summary.topDisease, "disease"],
    ["Most Affected District", summary.mostAffectedDistrict, "district"],
  ];

  return (
    <main className="gov-page">
      <header className="gov-header">
        <div className="gov-brand">
          <span>✚</span>
          <div>
            <p>Government of India · AYUSH Digital Health</p>
            <h1>National Health Monitoring Dashboard</h1>
          </div>
        </div>
        <div className="gov-header-actions">
          <span className="secure-badge">● Secure government access</span>
          <button onClick={signOut}>Sign out</button>
        </div>
      </header>

      <section className="gov-intro">
        <div>
          <p className="eyebrow">Population health intelligence</p>
          <h2>Monitor healthcare activity, not individual patients.</h2>
          <p>
            All views use aggregate consultation data for surveillance and
            planning.
          </p>
        </div>
        <p className="last-updated">
          Data refreshes whenever a filter changes.
        </p>
      </section>

      <section className="filter-bar">
        <label>
          State
          <select
            value={filters.state}
            onChange={(event) => changeFilter("state", event.target.value)}
          >
            <option value="">All states</option>
            {dashboard?.filters?.states.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
        </label>
        <label>
          District
          <select
            value={filters.district}
            disabled={!filters.state}
            onChange={(event) => changeFilter("district", event.target.value)}
          >
            <option value="">All districts</option>
            {districts.map((district) => (
              <option key={district}>{district}</option>
            ))}
          </select>
        </label>
        <label>
          Disease
          <select
            value={filters.disease}
            onChange={(event) => changeFilter("disease", event.target.value)}
          >
            <option value="">All categories</option>
            {dashboard?.filters?.diseases.map((disease) => (
              <option key={disease}>{disease}</option>
            ))}
          </select>
        </label>
        <label>
          Time period
          <select
            value={filters.period}
            onChange={(event) => changeFilter("period", event.target.value)}
          >
            <option value="all">All time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="365d">Last 12 months</option>
          </select>
        </label>
        <button className="reset-filters" onClick={reset}>
          Reset
        </button>
      </section>

      {error && <p className="gov-error">{error}</p>}

      {loading && !dashboard ? (
        <div className="gov-loading">Loading secure health analytics…</div>
      ) : (
        <>
          <section className="gov-main-grid">
            <GovernmentMap
              stateIntensity={dashboard?.stateIntensity}
              selectedState={filters.state}
              onSelectState={(state) => changeFilter("state", state)}
            />
            <div className="summary-grid">
              {cards.map(([label, value, type]) => (
                <article className={`summary-card ${type}`} key={label}>
                  <span>{label}</span>
                  <strong>
                    {typeof value === "number"
                      ? formatNumber(value)
                      : value || "—"}
                  </strong>
                </article>
              ))}
            </div>
          </section>

          <section className="charts-grid">
            <BarChart
              title="Disease distribution"
              items={dashboard?.charts?.diseaseDistribution}
              tone="coral"
            />
            <TrendChart items={dashboard?.charts?.monthlyTrend} />
            <BarChart
              title="Age distribution"
              items={dashboard?.charts?.ageDistribution}
              tone="green"
            />
            <BarChart
              title="Gender distribution"
              items={dashboard?.charts?.genderDistribution}
              tone="purple"
            />
            <BarChart
              title="Top diseases"
              items={dashboard?.charts?.topDiseases}
            />
          </section>

          <section className="insight-alert-grid">
            <article className="ai-insight">
              <div>
                <p className="eyebrow">AI health insight</p>
                <h2>Aggregate public-health summary</h2>
              </div>
              <button onClick={createInsight} disabled={insightLoading}>
                {insightLoading ? "Generating…" : "Generate insight"}
              </button>
              <p>
                {insight ||
                  "Generate an AI summary based on the currently selected aggregate data."}
              </p>
              <small>
                This is decision support, not a diagnosis or outbreak
                declaration.
              </small>
            </article>

            <article className="alerts-panel">
              <p className="eyebrow">Recent alerts</p>
              <h2>Signals for review</h2>
              <div>
                {dashboard?.alerts?.map((alert) => (
                  <div className={`alert ${alert.severity}`} key={alert.title}>
                    <b>{alert.title}</b>
                    <p>{alert.detail}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}
