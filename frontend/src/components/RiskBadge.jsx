const riskStyles = {
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  High: "bg-orange-100 text-orange-800 border-orange-200",
  Critical: "bg-red-100 text-red-800 border-red-200",
};

export default function RiskBadge({ level }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        riskStyles[level] || riskStyles.Low
      }`}
    >
      {level}
    </span>
  );
}
