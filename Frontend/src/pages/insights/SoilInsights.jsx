import { useState, useEffect, useMemo } from "react";
import { FiDroplet, FiClock, FiActivity, FiLayers } from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../components/ui/StatusBadge";
import { useTheme } from "../../hooks/useTheme";
import api from "../../components/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function SoilInsights() {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState("24h"); // "24h" | "7d" | "30d"
  const [telemetryData, setTelemetryData] = useState(null);
  const [isSample, setIsSample] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    let isMounted = true;
    api.get(`/api/telemetry/history?range=${timeframe}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.data && !res.data.isSample && Array.isArray(res.data.soil) && res.data.soil.length > 0) {
          setTelemetryData(res.data.soil);
          setIsSample(false);
        } else {
          setTelemetryData(null);
          setIsSample(true);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setTelemetryData(null);
        setIsSample(true);
      });
    return () => {
      isMounted = false;
    };
  }, [timeframe]);

  const hourlyData = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        moisture: Math.floor(Math.sin(i / 3) * 8 + 64),
        temperature: Math.floor(Math.cos(i / 4) * 4 + 26),
        pH: Number((6.7 + Math.sin(i) * 0.2).toFixed(1)),
      })),
    []
  );

  const weeklyData = useMemo(
    () =>
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
        label: day,
        moisture: Math.floor(Math.sin(i) * 6 + 65),
        temperature: Math.floor(Math.cos(i) * 3 + 27),
        pH: Number((6.8 + (i % 2) * 0.1).toFixed(1)),
      })),
    []
  );

  const activeDataset = telemetryData && telemetryData.length > 0
    ? telemetryData
    : (timeframe === "24h" ? hourlyData : weeklyData);

  const chartData = useMemo(
    () => ({
      labels: activeDataset.map((d) => d.label),
      datasets: [
        {
          label: "Moisture (%)",
          data: activeDataset.map((d) => d.moisture),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2.5,
        },
        {
          label: "Temperature (°C)",
          data: activeDataset.map((d) => d.temperature),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.05)",
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 5,
          borderWidth: 2,
          borderDash: [4, 4],
        },
      ],
    }),
    [activeDataset]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: typeof window !== "undefined" && window.innerWidth < 768 ? false : { duration: 400 },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: isDark ? "#cbd5e1" : "#0f172a",
            font: { family: "-apple-system, sans-serif", size: 12, weight: 600 },
            usePointStyle: true,
            boxWidth: 6,
          },
        },
        tooltip: {
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(15, 23, 42, 0.9)",
          titleFont: { size: 12, weight: "bold" },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 12,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: isDark ? "#94a3b8" : "#334155", font: { size: 11, weight: 500 } },
        },
        y: {
          grid: { color: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" },
          ticks: { color: isDark ? "#94a3b8" : "#334155", font: { size: 11, weight: 500 } },
        },
      },
    }),
    [isDark]
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="glass-pill px-3 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {t("insights.soil.suite", "Telemetry Suite")}
            </span>
            <StatusBadge status="online" size="sm" label={t("insights.soil.nodes_active", "4 Nodes Active")} />
            {isSample && (
              <StatusBadge status="warning" size="sm" label={t("insights.sample_data", "Sample data")} />
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {t("insights.soil.title", "Soil Moisture & Subsurface Telemetry")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            {t("insights.soil.desc", "Real-time volumetric water content, rhizosphere temperature, and chemical alkalinity trends.")}
          </p>
        </div>

        {/* Timeframe Segmented Control */}
        <div className="glass-pill p-1 flex items-center gap-1 self-start sm:self-auto select-none">
          {["24h", "7d"].map((tKey) => (
            <button
              key={tKey}
              type="button"
              onClick={() => setTimeframe(tKey)}
              className={`px-3.5 py-1 text-xs font-bold uppercase rounded-full transition-all cursor-pointer ${
                timeframe === tKey
                  ? "bg-white dark:bg-slate-700 text-emerald-950 dark:text-emerald-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {tKey}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              {t("insights.soil.mean_moisture", "Mean Moisture")}
            </span>
            <FiDroplet className="text-emerald-700 dark:text-emerald-400 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">65.2%</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">
            {t("insights.soil.optimal_moisture", "Optimal Range (60% - 70%)")}
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              {t("insights.soil.rhizosphere_temp", "Rhizosphere Temp")}
            </span>
            <FiActivity className="text-amber-700 dark:text-amber-400 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">27.4°C</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-1">
            {t("insights.soil.root_growth", "Equilibrium for root growth")}
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              {t("insights.soil.alkalinity", "Chemical Alkalinity")}
            </span>
            <FiLayers className="text-teal-700 dark:text-teal-400 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">6.8 pH</p>
          <p className="text-xs text-teal-700 dark:text-teal-400 font-bold mt-1">
            {t("insights.soil.ideal_ph", "Slightly Acidic (Ideal)")}
          </p>
        </div>
      </div>

      {/* Chart.js Graph Container */}
      <div className="glass-card p-6 md:p-8 rounded-3xl mb-8 border border-slate-900/10 dark:border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
            <FiClock className="text-emerald-700 dark:text-emerald-400" />
            {t("insights.soil.curve_title", "Dynamic Moisture & Temperature Curve")}
          </h2>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
            {t("insights.soil.sensor_array", "Sensor Array #104")}
          </span>
        </div>

        <div className="w-full h-72 sm:h-84">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Historical Telemetry Table in Liquid Glass */}
      <div className="glass-card p-6 rounded-3xl overflow-hidden border border-slate-900/10 dark:border-white/10">
        <h3 className="text-base font-bold text-slate-950 dark:text-slate-50 mb-4">
          {t("insights.soil.log_records", "Sensor Log Records")} ({timeframe === "24h" ? t("insights.soil.hourly_intervals", "Hourly Intervals") : t("insights.soil.daily_averages", "Daily Averages")})
        </h3>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <th className="py-3 px-4">{t("insights.soil.timestamp", "Timestamp")}</th>
                <th className="py-3 px-4">{t("insights.soil.moisture", "Moisture")}</th>
                <th className="py-3 px-4">{t("insights.soil.temperature", "Temperature")}</th>
                <th className="py-3 px-4">{t("insights.soil.ph", "pH Reading")}</th>
                <th className="py-3 px-4">{t("insights.soil.status", "Quality Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-xs text-slate-800 dark:text-slate-200 font-medium">
              {activeDataset.slice(0, 8).map((d, i) => (
                <tr key={i} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-950 dark:text-slate-50">
                    {d.label}
                  </td>
                  <td className="py-3 px-4 font-black text-emerald-700 dark:text-emerald-400">
                    {d.moisture}%
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{d.temperature}°C</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{d.pH}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status="online" size="sm" label={t("insights.soil.nominal", "Nominal")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SoilInsights;
