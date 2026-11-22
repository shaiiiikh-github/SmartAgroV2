import { useState, useEffect, useMemo } from "react";
import { FiImage, FiCalendar, FiShield, FiActivity, FiTrendingUp } from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../components/ui/StatusBadge";
import { useTheme } from "../../hooks/useTheme";
import api from "../../components/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function CropInsights() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [telemetryData, setTelemetryData] = useState(null);
  const [isSample, setIsSample] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.get("/api/telemetry/history?range=7d")
      .then((res) => {
        if (!isMounted) return;
        if (res.data && !res.data.isSample && Array.isArray(res.data.crop) && res.data.crop.length > 0) {
          setTelemetryData(res.data.crop);
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
  }, []);

  const scanHistory = useMemo(
    () => [
      { date: "Day 1", health: 75, risk: 42, stage: "Emergence" },
      { date: "Day 3", health: 80, risk: 32, stage: "Vegetative" },
      { date: "Day 5", health: 84, risk: 24, stage: "Vegetative" },
      { date: "Day 7", health: 88, risk: 18, stage: "Tillering" },
      { date: "Day 9", health: 91, risk: 12, stage: "Tillering" },
      { date: "Day 11", health: 89, risk: 15, stage: "Heading" },
      { date: "Today", health: 94, risk: 8, stage: "Heading" },
    ],
    []
  );

  const activeCrop = telemetryData && telemetryData.length > 0 ? telemetryData : scanHistory;

  const chartData = useMemo(
    () => ({
      labels: activeCrop.map((d) => d.date),
      datasets: [
        {
          label: `${t("insights.crop.health_index", "Health Index")} (/100)`,
          data: activeCrop.map((d) => d.health),
          backgroundColor: "rgba(16, 185, 129, 0.75)",
          borderRadius: 8,
        },
        {
          label: `${t("insights.crop.pathology_col", "Pathology Risk")} (%)`,
          data: activeCrop.map((d) => d.risk),
          backgroundColor: "rgba(239, 68, 68, 0.65)",
          borderRadius: 8,
        },
      ],
    }),
    [activeCrop, t]
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
          },
        },
        tooltip: {
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(15, 23, 42, 0.9)",
          cornerRadius: 12,
          padding: 10,
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
            <span className="glass-pill px-3 py-0.5 text-xs font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider">
              {t("insights.crop.agronomy", "Agronomy Intelligence")}
            </span>
            <StatusBadge status="online" size="sm" label={t("insights.crop.optimal_vigor", "Optimal Vigor")} />
            {isSample && (
              <StatusBadge status="warning" size="sm" label={t("insights.sample_data", "Sample data")} />
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
            {t("insights.crop.title", "Crop Health & Pathology Lifecycle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            {t("insights.crop.desc", "Multi-spectral vegetation index, phenological stage progression, and pathogen probability.")}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              {t("insights.crop.vigor_score", "Vigor Score")}
            </span>
            <FiActivity className="text-emerald-700 dark:text-emerald-400 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">94 / 100</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">
            {t("insights.crop.canopy_dev", "Robust canopy development")}
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              {t("insights.crop.pathology_risk", "Pathology Risk")}
            </span>
            <FiShield className="text-emerald-700 dark:text-emerald-400 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">8%</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">
            {t("insights.crop.blight_prob", "Negligible blight probability")}
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              {t("insights.crop.current_stage", "Current Stage")}
            </span>
            <FiTrendingUp className="text-teal-700 dark:text-teal-400 text-base" />
          </div>
          <p className="text-2xl font-black text-slate-950 dark:text-slate-50">Heading Stage</p>
          <p className="text-xs text-slate-700 dark:text-slate-400 font-semibold mt-1">
            {t("insights.crop.days_to_harvest", "Days to harvest: ~24 days")}
          </p>
        </div>
      </div>

      {/* Chart.js Bar Chart */}
      <div className="glass-card p-6 md:p-8 rounded-3xl mb-8 border border-slate-900/10 dark:border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
            <FiImage className="text-teal-700 dark:text-teal-400" />
            {t("insights.crop.curve_title", "Vegetation Health vs Disease Probability History")}
          </h2>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
            {t("insights.crop.timeline", "14-Day Timeline")}
          </span>
        </div>

        <div className="w-full h-72 sm:h-84">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Scan Log */}
      <div className="glass-card p-6 rounded-3xl border border-slate-900/10 dark:border-white/10">
        <h3 className="text-base font-bold text-slate-950 dark:text-slate-50 mb-4 flex items-center gap-2">
          <FiCalendar className="text-emerald-700 dark:text-emerald-400" />
          {t("insights.crop.records", "Foliage Inspection Records")}
        </h3>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <th className="py-3 px-4">{t("insights.crop.inspection_date", "Inspection Date")}</th>
                <th className="py-3 px-4">{t("insights.crop.stage_col", "Phenology Stage")}</th>
                <th className="py-3 px-4">{t("insights.crop.health_index", "Health Index")}</th>
                <th className="py-3 px-4">{t("insights.crop.pathology_col", "Pathology Risk")}</th>
                <th className="py-3 px-4">{t("insights.crop.action", "Action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-xs text-slate-800 dark:text-slate-200 font-medium">
              {activeCrop.map((d, i) => (
                <tr key={i} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-950 dark:text-slate-50">
                    {d.date}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{d.stage}</td>
                  <td className="py-3 px-4 font-black text-emerald-700 dark:text-emerald-400">
                    {d.health}/100
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{d.risk}%</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={d.risk < 20 ? "online" : "warning"} size="sm" label={t("insights.crop.recorded", "Recorded")} />
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

export default CropInsights;
