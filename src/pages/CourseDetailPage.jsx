import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AuthContext } from "../context/AuthContext";
import {
  deleteUserCourse,
  fetchUserCourse,
  updateUserCourse,
} from "../api/users";
import CourseFormModal from "../components/CourseFormModal";
import GradeTable from "../components/GradeTable";
import Modal from "../components/Modal";
import ProgressBar from "../components/ProgressBar";
import { formatAverage, getDaysLabel } from "../utils/courseHelpers";

function CourseDetailPage() {
  const { user } = useContext(AuthContext);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadCourse() {
      if (!user?.userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const response = await fetchUserCourse(user.userId, courseId);
        setCourse(response.course);
      } catch (err) {
        setError(err.message || "Unable to load course");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourse();
  }, [courseId, user?.userId]);

  const categoryData = useMemo(() => {
    if (!course?.assessments) {
      return [];
    }

    const grouped = course.assessments.reduce((accumulator, assessment) => {
      if (!accumulator[assessment.category]) {
        accumulator[assessment.category] = [];
      }
      accumulator[assessment.category].push(assessment);
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([category, assessments]) => {
      const graded = assessments.filter(
        (assessment) => assessment.earnedMarks !== null && Number(assessment.totalMarks) > 0
      );

      const average = graded.length
        ? graded.reduce((sum, assessment) => {
            return sum + (Number(assessment.earnedMarks) / Number(assessment.totalMarks)) * 100;
          }, 0) / graded.length
        : 0;

      return {
        name: category,
        average: Number(average.toFixed(1)),
      };
    });
  }, [course]);

  const upcomingAssessments = useMemo(
    () => (course?.assessments || []).filter((assessment) => assessment.status !== "completed"),
    [course]
  );

  const handleDelete = async () => {
    try {
      await deleteUserCourse(user.userId, course.id);
      navigate("/courses");
    } catch (err) {
      setError(err.message || "Unable to delete course");
    }
  };

  const handleUpdateCourse = async (form) => {
    try {
      setIsSaving(true);
      setError("");
      const response = await updateUserCourse(user.userId, course.id, form);
      setCourse((current) => ({
        ...current,
        ...response.course,
      }));
      setSuccessMessage(`${form.code.toUpperCase()} was updated successfully.`);
      setShowEditModal(false);
    } catch (err) {
      setError(err.message || "Unable to update course");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div className="card">Please log in to view this course.</div>;
  }

  if (isLoading) {
    return <div className="card">Loading course...</div>;
  }

  if (!course) {
    return <div className="card">Course not found.</div>;
  }

  return (
    <div className="student-page">
      {successMessage ? <div className="alert-box success-alert">{successMessage}</div> : null}
      {error ? <div className="alert-box error-alert">{error}</div> : null}

      <div className="page-header">
        <div>
          <p className="eyebrow">Course Page</p>
          <h1 className="page-title">{course.code}</h1>
          <p className="page-subtitle">{course.name}</p>
          <div className="detail-meta">
            <span>Instructor: {course.instructor}</span>
            <span>Term: {course.term}</span>
            <span>Room: {course.room || "TBA"}</span>
            <span>Schedule: {course.schedule || "TBA"}</span>
          </div>
        </div>
        <div className="stack-actions">
          <button className="btn-secondary" onClick={() => setShowEditModal(true)}>
            Edit Course
          </button>
          <button className="btn-danger" onClick={() => setShowDelete(true)}>
            Remove Course
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="section-heading">
            <div>
              <h2>Current Average</h2>
              <p>Calculated from completed assessments</p>
            </div>
          </div>
          <div className="average-hero">
            <div className="average-number">{formatAverage(course.average)}</div>
            <div className="average-progress">
              <ProgressBar percentage={course.average} size="lg" />
              <p className="supporting-text">
                {course.completedAssessments} of {course.assessmentsCount} assessments graded
              </p>
            </div>
          </div>
          <div className="description-block">
            <h3>Course Description</h3>
            <p>{course.description || "Course details will appear here once configured."}</p>
          </div>
        </div>

        <div className="card">
          <div className="section-heading">
            <div>
              <h2>Progress</h2>
              <p>Completion across all assessments</p>
            </div>
          </div>
          <ProgressBar percentage={course.progress} label="Assessment Completion" />
          <div className="mini-metrics">
            <div>
              <span className="mini-label">Assessments</span>
              <strong>{course.assessmentsCount}</strong>
            </div>
            <div>
              <span className="mini-label">Completed</span>
              <strong>{course.completedAssessments}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="section-heading">
            <div>
              <h2>Upcoming Assessments</h2>
              <p>Pending work for this course</p>
            </div>
          </div>

          {upcomingAssessments.length === 0 ? (
            <div className="empty-state">
              <p>No upcoming assessments for this course.</p>
              <p className="summary-helper">This course is fully caught up right now.</p>
            </div>
          ) : (
            <div className="upcoming-list">
              {upcomingAssessments.map((assessment) => (
                <div key={assessment.id} className="upcoming-item static-item">
                  <div>
                    <p className="item-title">{assessment.title}</p>
                    <p className="item-meta">
                      {assessment.category} • Weight {assessment.weight}%
                    </p>
                  </div>
                  <div className="item-badge-group">
                    <span className={`status-chip ${assessment.status}`}>
                      {getDaysLabel(assessment.daysLeft)}
                    </span>
                    <span className="item-date">{assessment.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-heading">
            <div>
              <h2>Category Performance</h2>
              <p>Current average by assessment category</p>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="empty-state">
              <p>No graded work yet.</p>
            </div>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="average" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-heading">
          <div>
            <h2>Assessments</h2>
            <p>Everything currently stored under this course</p>
          </div>
        </div>
        <GradeTable assessments={course.assessments || []} />
      </div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Remove Course">
        <p className="modal-copy">
          Remove <strong>{course.code}</strong> from your courses? This also removes its stored assessments.
        </p>
        <div className="modal-actions">
          <button onClick={handleDelete} className="btn-danger">
            Yes, Remove Course
          </button>
          <button onClick={() => setShowDelete(false)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </Modal>

      <CourseFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateCourse}
        initialValues={{
          code: course.code,
          name: course.name,
          instructor: course.instructor,
          term: course.term,
        }}
        title="Edit Course"
        submitLabel="Save Changes"
        isSubmitting={isSaving}
        error={error}
      />
    </div>
  );
}

export default CourseDetailPage;
