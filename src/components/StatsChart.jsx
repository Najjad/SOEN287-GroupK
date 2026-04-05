import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function StatsChart({ courseBreakdown = [], assessmentStatus = [] }) {
  const courseData = {
    labels: courseBreakdown.map((course) => course.code),
    datasets: [
      {
        label: "Students Enrolled",
        data: courseBreakdown.map((course) => course.studentsEnrolled),
        backgroundColor: "rgba(79, 70, 229, 0.78)",
        borderRadius: 12,
      },
      {
        label: "Avg Progress %",
        data: courseBreakdown.map((course) => course.averageProgress),
        backgroundColor: "rgba(6, 182, 212, 0.72)",
        borderRadius: 12,
      },
    ],
  };

  const assessmentData = {
    labels: assessmentStatus.map((status) => status.label),
    datasets: [
      {
        data: assessmentStatus.map((status) => status.value),
        backgroundColor: assessmentStatus.map((status) => status.color),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="usage-chart-grid">
      <section className="card usage-chart-card">
        <div className="section-heading">
          <div>
            <h2>Course Reach</h2>
            <p>Most-used courses and how far students have progressed in them.</p>
          </div>
        </div>

        {courseBreakdown.length === 0 ? (
          <div className="empty-state">
            <p>No course usage data yet.</p>
          </div>
        ) : (
          <div className="chart-shell">
            <Bar
              data={courseData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        )}
      </section>

      <section className="card usage-chart-card">
        <div className="section-heading">
          <div>
            <h2>Assessment Status Mix</h2>
            <p>Quick snapshot of how student work is distributed right now.</p>
          </div>
        </div>

        {assessmentStatus.every((status) => status.value === 0) ? (
          <div className="empty-state">
            <p>No assessment data yet.</p>
          </div>
        ) : (
          <div className="chart-shell doughnut-shell">
            <Doughnut
              data={assessmentData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                cutout: "68%",
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default StatsChart;
