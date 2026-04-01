import { getProgressTone } from "../utils/courseHelpers";

function ProgressBar({ percentage, label, size = "md" }) {
  const heights = {
    sm: 8,
    md: 12,
    lg: 16,
  };

  return (
    <div className="progress-wrapper">
      {label ? (
        <div className="progress-label-row">
          <span>{label}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      ) : null}
      <div className="progress-track" style={{ height: heights[size] }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            height: heights[size],
            background: getProgressTone(percentage),
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
