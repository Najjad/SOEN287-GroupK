import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  createUserCourse,
  fetchUserDashboard,
} from "../api/users";
import CourseCard from "../components/CourseCard";
import CourseFormModal from "../components/CourseFormModal";
import { formatAverage, getDaysLabel } from "../utils/courseHelpers";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    overview: {
      courseCount: 0,
      overallAverage: 0,
      upcomingCount: 0,
      completedCount: 0,
    },
    courses: [],
    upcomingAssessments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const nextDue = useMemo(
    () => dashboardData.upcomingAssessments[0] || null,
    [dashboardData.upcomingAssessments]
  );

  useEffect(() => {
    async function loadDashboard() {
      if (!user?.userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const response = await fetchUserDashboard(user.userId);
        setDashboardData(response);
      } catch (err) {
        setError(err.message || "Unable to load dashboard");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [user?.userId]);

  const handleCreateCourse = async (form) => {
    try {
      setIsSaving(true);
      setFormError("");
      await createUserCourse(user.userId, form);
      const response = await fetchUserDashboard(user.userId);
      setDashboardData(response);
      setShowAddModal(false);
      setSuccessMessage(`${form.code.toUpperCase()} was added to your course list.`);
    } catch (err) {
      setFormError(err.message || "Unable to save course");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div className="card">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="student-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student Dashboard</p>
          <h1 className="page-title">Welcome back.</h1>
          <p className="page-subtitle">
            Review your enrolled courses, upcoming assessments, and quick progress summaries.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          Add Course
        </button>
      </div>

      {successMessage ? <div className="alert-box success-alert">{successMessage}</div> : null}
      {error ? <div className="alert-box error-alert">{error}</div> : null}

      {isLoading ? (
        <div className="card">Loading dashboard...</div>
      ) : (
        <>
          <section className="stats-grid">
            <StatCard title="Enrolled Courses" value={dashboardData.overview.courseCount} />
            <StatCard title="Overall Average" value={formatAverage(dashboardData.overview.overallAverage)} />
            <StatCard title="Upcoming Assessments" value={dashboardData.overview.upcomingCount} />
            <StatCard
              title="Next Deadline"
              value={nextDue ? nextDue.dueDate : "None"}
              helper={nextDue ? `${nextDue.title} • ${nextDue.courseCode}` : "No pending work"}
            />
          </section>

          <section className="dashboard-two-column">
            <div className="card">
              <div className="section-heading">
                <div>
                  <h2>Course Overview</h2>
                  <p>{dashboardData.courses.length} courses currently saved for you.</p>
                </div>
              </div>

              {dashboardData.courses.length === 0 ? (
                <div className="empty-state">
                  <p>No courses yet. Add one to start building your dashboard.</p>
                </div>
              ) : (
                <div className="course-grid">
                  {dashboardData.courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onClick={() => navigate(`/courses/${course.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="section-heading">
                <div>
                  <h2>Upcoming Assessments</h2>
                  <p>Across all courses</p>
                </div>
              </div>

              {dashboardData.upcomingAssessments.length === 0 ? (
                <div className="empty-state">
                  <p>No upcoming assessments right now.</p>
                  <p className="summary-helper">Each new course now comes with starter assessment data so this section stays useful.</p>
                </div>
              ) : (
                <div className="upcoming-list">
                  {dashboardData.upcomingAssessments.slice(0, 6).map((assessment) => (
                    <button
                      key={assessment.id}
                      className="upcoming-item"
                      onClick={() => navigate(`/courses/${assessment.courseId}`)}
                    >
                      <div>
                        <p className="item-title">{assessment.title}</p>
                        <p className="item-meta">
                          {assessment.courseCode} • {assessment.category}
                        </p>
                      </div>
                      <div className="item-badge-group">
                        <span className={`status-chip ${assessment.status}`}>
                          {getDaysLabel(assessment.daysLeft)}
                        </span>
                        <span className="item-date">{assessment.dueDate}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <CourseFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormError("");
        }}
        onSubmit={handleCreateCourse}
        title="Add Course"
        submitLabel="Save Course"
        isSubmitting={isSaving}
        error={formError}
      />
    </div>
  );
}

function StatCard({ title, value, helper = "" }) {
  return (
    <div className="summary-card">
      <p className="summary-label">{title}</p>
      <div className="summary-value">{value}</div>
      {helper ? <p className="summary-helper">{helper}</p> : null}
    </div>
  );
}
