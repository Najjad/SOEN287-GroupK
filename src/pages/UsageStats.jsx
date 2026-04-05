import { useContext, useEffect, useMemo, useState } from "react";
import StatsChart from "../components/StatsChart";
import { fetchUsageStats } from "../api/users";
import { AuthContext } from "../context/AuthContext";

function UsageStats() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    generatedAt: "",
    overview: {
      studentCount: 0,
      totalCourses: 0,
      templateCount: 0,
      adoptionRate: 0,
      averageCourseProgress: 0,
      completedAssessments: 0,
    },
    assessmentStatus: [],
    courseBreakdown: [],
    templateAdoption: [],
    studentEngagement: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsageStats() {
      try {
        setIsLoading(true);
        setError("");
        const response = await fetchUsageStats();
        setStats(response);
      } catch (err) {
        setError(err.message || "Unable to load usage statistics");
      } finally {
        setIsLoading(false);
      }
    }

    loadUsageStats();
  }, []);

  const topCourse = useMemo(() => stats.courseBreakdown[0] || null, [stats.courseBreakdown]);
  const topTemplate = useMemo(
    () => stats.templateAdoption.find((template) => template.coursesCreated > 0) || stats.templateAdoption[0] || null,
    [stats.templateAdoption]
  );
  const mostActiveSegment = useMemo(() => {
    return [...stats.studentEngagement].sort((left, right) => right.value - left.value)[0] || null;
  }, [stats.studentEngagement]);

  if (!user) {
    return <div className="card">Please log in to view usage statistics.</div>;
  }

  if (user.role !== "admin") {
    return <div className="card">Only admins can view the usage statistics page.</div>;
  }

  return (
    <div className="student-page usage-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin Insights</p>
          <h1 className="page-title">Usage Statistics</h1>
          <p className="page-subtitle">
            Understand how students are using the platform, which templates are taking off, and where activity is concentrated.
          </p>
        </div>
        <div className="usage-generated-tag">
          {stats.generatedAt ? `Updated ${new Date(stats.generatedAt).toLocaleString()}` : "Live usage snapshot"}
        </div>
      </div>

      {error ? <div className="alert-box error-alert">{error}</div> : null}

      {isLoading ? (
        <div className="card">Loading usage statistics...</div>
      ) : (
        <>
          <section className="stats-grid">
            <StatCard
              title="Active Students"
              value={stats.overview.studentCount}
              helper="Student accounts tracked in the database."
            />
            <StatCard
              title="Courses Tracked"
              value={stats.overview.totalCourses}
              helper="Total student course records currently saved."
            />
            <StatCard
              title="Templates Saved"
              value={stats.overview.templateCount}
              helper="Reusable structures available to students."
            />
            <StatCard
              title="Template Adoption"
              value={`${stats.overview.adoptionRate}%`}
              helper="Share of saved courses created from templates."
            />
            <StatCard
              title="Average Progress"
              value={`${stats.overview.averageCourseProgress}%`}
              helper="Mean completion progress across all courses."
            />
            <StatCard
              title="Completed Assessments"
              value={stats.overview.completedAssessments}
              helper="Assessment items already marked complete."
            />
          </section>

          <section className="usage-highlight-grid">
            <article className="card usage-highlight-card">
              <p className="eyebrow">Most Popular Course</p>
              <h2>{topCourse ? `${topCourse.code} - ${topCourse.name}` : "No data yet"}</h2>
              <p className="summary-helper">
                {topCourse
                  ? `${topCourse.studentsEnrolled} student records, ${topCourse.averageProgress}% average progress, ${topCourse.averageGrade}% average grade.`
                  : "Once students begin adding courses, the leading course will appear here."}
              </p>
            </article>

            <article className="card usage-highlight-card">
              <p className="eyebrow">Top Template</p>
              <h2>{topTemplate ? topTemplate.name : "No template usage yet"}</h2>
              <p className="summary-helper">
                {topTemplate
                  ? `${topTemplate.coursesCreated} courses created from this structure across ${topTemplate.categoryCount} categories.`
                  : "Create templates and let students adopt them to see ranking here."}
              </p>
            </article>

            <article className="card usage-highlight-card">
              <p className="eyebrow">Student Activity Mix</p>
              <h2>{mostActiveSegment ? mostActiveSegment.label : "No student data"}</h2>
              <p className="summary-helper">
                {mostActiveSegment
                  ? `${mostActiveSegment.value} students fall into this group. ${mostActiveSegment.helper}`
                  : "Student engagement groups will appear after accounts start using the app."}
              </p>
            </article>
          </section>

          <StatsChart
            courseBreakdown={stats.courseBreakdown}
            assessmentStatus={stats.assessmentStatus}
          />

          <section className="detail-grid usage-detail-grid">
            <div className="card">
              <div className="section-heading">
                <div>
                  <h2>Template Adoption</h2>
                  <p>See which reusable structures students rely on most.</p>
                </div>
              </div>

              {stats.templateAdoption.length === 0 ? (
                <div className="empty-state">
                  <p>No templates saved yet.</p>
                </div>
              ) : (
                <div className="usage-list">
                  {stats.templateAdoption.map((template) => (
                    <div key={template.id || template.name} className="usage-list-row">
                      <div>
                        <p className="item-title">{template.name}</p>
                        <p className="item-meta">
                          {template.categoryCount} categories
                          {template.description ? ` • ${template.description}` : ""}
                        </p>
                      </div>
                      <div className="usage-metric-pair">
                        <strong>{template.coursesCreated}</strong>
                        <span>{template.shareOfTemplateCourses}% of template-based courses</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="section-heading">
                <div>
                  <h2>Student Engagement</h2>
                  <p>Quick grouping of how deeply students are using the planner.</p>
                </div>
              </div>

              <div className="usage-list">
                {stats.studentEngagement.map((segment) => (
                  <div key={segment.label} className="usage-list-row">
                    <div>
                      <p className="item-title">{segment.label}</p>
                      <p className="item-meta">{segment.helper}</p>
                    </div>
                    <div className="usage-metric-pair">
                      <strong>{segment.value}</strong>
                      <span>students</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="section-heading">
              <div>
                <h2>Course Performance Breakdown</h2>
                <p>Ranked by student usage, with progress and grade trends side by side.</p>
              </div>
            </div>

            {stats.courseBreakdown.length === 0 ? (
              <div className="empty-state">
                <p>No course records yet.</p>
              </div>
            ) : (
              <div className="usage-table">
                {stats.courseBreakdown.map((course) => (
                  <article key={course.code} className="usage-table-row">
                    <div>
                      <p className="course-code">{course.code}</p>
                      <h3 className="course-name">{course.name}</h3>
                      <p className="item-meta">
                        {course.completedAssessments} completed • {course.pendingAssessments} pending
                      </p>
                    </div>

                    <div className="usage-inline-metrics">
                      <div>
                        <span className="mini-label">Students</span>
                        <strong>{course.studentsEnrolled}</strong>
                      </div>
                      <div>
                        <span className="mini-label">Avg Grade</span>
                        <strong>{course.averageGrade}%</strong>
                      </div>
                      <div>
                        <span className="mini-label">Avg Progress</span>
                        <strong>{course.averageProgress}%</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, helper }) {
  return (
    <article className="summary-card">
      <p className="summary-label">{title}</p>
      <div className="summary-value">{value}</div>
      <p className="summary-helper">{helper}</p>
    </article>
  );
}

export default UsageStats;
