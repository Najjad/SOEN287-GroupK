import { formatAverage, getAverageColor, getProgressTone } from "../utils/courseHelpers";

function CourseCard({ course, onClick, onEdit, onDelete }) {
  const averageColor = getAverageColor(course.average);
  const progressColor = getProgressTone(course.progress ?? course.average);

  return (
    <article onClick={onClick} className="course-card">
      <div className="course-card-header">
        <div>
          <p className="course-code">{course.code}</p>
          <h3 className="course-name">{course.name}</h3>
        </div>
        <div className="course-average" style={{ color: averageColor }}>
          {formatAverage(course.average)}
        </div>
      </div>

      <div className="course-meta">
        <p>{course.instructor}</p>
        <p>{course.term}</p>
      </div>

      <div className="progress-shell">
        <div
          className="progress-fill"
          style={{
            width: `${course.progress ?? course.average}%`,
            background: progressColor,
          }}
        />
      </div>

      <div className="course-stats">
        <span>{course.assessmentsCount ?? course.assessments ?? 0} assessments</span>
        <span>{course.pendingAssessments ?? 0} upcoming</span>
      </div>

      {course.nextAssessment ? (
        <div className="course-next-item">
          <span className="course-next-label">Next up</span>
          <strong>{course.nextAssessment.title}</strong>
          <span>{course.nextAssessment.dueDate}</span>
        </div>
      ) : null}

      <div className="card-action-row">
        <button
          type="button"
          className="btn-primary"
          onClick={(event) => {
            event.stopPropagation();
            onClick?.();
          }}
        >
          View Course
        </button>
        {onEdit ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            className="btn-danger"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default CourseCard;
