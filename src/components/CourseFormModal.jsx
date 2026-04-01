import { useEffect, useState } from "react";
import Modal from "./Modal";

const emptyCourse = {
  code: "",
  name: "",
  instructor: "",
  termSeason: "Winter",
  termYear: "2026",
};

function parseInitialValues(initialValues) {
  const termMatch = (initialValues.term || "").match(/^(Winter|Summer|Fall)\s+(\d{4})$/);

  return {
    code: initialValues.code || "",
    name: initialValues.name || "",
    instructor: initialValues.instructor || "",
    termSeason: termMatch?.[1] || "Winter",
    termYear: termMatch?.[2] || "2026",
  };
}

function CourseFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues = emptyCourse,
  title,
  submitLabel,
  isSubmitting = false,
  error = "",
}) {
  const [form, setForm] = useState(parseInitialValues(initialValues));
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setForm(parseInitialValues(initialValues));
    setFieldErrors({});
  }, [initialValues, isOpen]);

  const validateField = (name, value, currentForm = form) => {
    if (name === "code") {
      if (!/^[A-Z]{4}\d{3}$/.test(value)) {
        return "Use 4 letters followed by 3 digits, like SOEN287.";
      }
    }

    if (name === "termSeason") {
      if (!["Winter", "Summer", "Fall"].includes(value)) {
        return "Term must be Winter, Summer, or Fall.";
      }
    }

    if (name === "termYear") {
      if (!/^\d{4}$/.test(value)) {
        return "Enter a 4-digit year.";
      }

      if (Number(value) < 2026) {
        return "Year must be 2026 or later.";
      }
    }

    if (name === "name" || name === "instructor") {
      if (!String(value).trim()) {
        return "This field is required.";
      }
    }

    const termPreview = `${currentForm.termSeason} ${currentForm.termYear}`;
    if (!/^(Winter|Summer|Fall)\s+\d{4}$/.test(termPreview)) {
      return null;
    }

    return "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const normalizedValue = name === "code" ? value.toUpperCase() : value;
    setForm((current) => {
      const nextForm = { ...current, [name]: normalizedValue };
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [name]: validateField(name, normalizedValue, nextForm),
      }));
      return nextForm;
    });
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: validateField(name, value, form),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {
      code: validateField("code", form.code, form),
      name: validateField("name", form.name, form),
      instructor: validateField("instructor", form.instructor, form),
      termSeason: validateField("termSeason", form.termSeason, form),
      termYear: validateField("termYear", form.termYear, form),
    };

    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    await onSubmit({
      code: form.code.trim(),
      name: form.name.trim(),
      instructor: form.instructor.trim(),
      term: `${form.termSeason} ${form.termYear}`,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="course-form">
        <label className="field-label" htmlFor="course-code">
          Course code
        </label>
        <input
          id="course-code"
          className={`input-field ${fieldErrors.code ? "input-error" : ""}`}
          name="code"
          value={form.code}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="SOEN287"
          required
        />
        {fieldErrors.code ? <p className="error-text field-error-text">{fieldErrors.code}</p> : null}

        <label className="field-label" htmlFor="course-name">
          Course name
        </label>
        <input
          id="course-name"
          className={`input-field ${fieldErrors.name ? "input-error" : ""}`}
          name="name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Web Programming"
          required
        />
        {fieldErrors.name ? <p className="error-text field-error-text">{fieldErrors.name}</p> : null}

        <label className="field-label" htmlFor="course-instructor">
          Instructor
        </label>
        <input
          id="course-instructor"
          className={`input-field ${fieldErrors.instructor ? "input-error" : ""}`}
          name="instructor"
          value={form.instructor}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Dr. Margaret Kwan"
          required
        />
        {fieldErrors.instructor ? <p className="error-text field-error-text">{fieldErrors.instructor}</p> : null}

        <label className="field-label" htmlFor="course-term-season">
          Term
        </label>
        <div className="term-grid">
          <select
            id="course-term-season"
            className={`input-field ${fieldErrors.termSeason ? "input-error" : ""}`}
            name="termSeason"
            value={form.termSeason}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="Winter">Winter</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
          </select>
          <input
            id="course-term-year"
            className={`input-field ${fieldErrors.termYear ? "input-error" : ""}`}
            name="termYear"
            value={form.termYear}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="2026"
            inputMode="numeric"
            required
          />
        </div>
        {fieldErrors.termSeason ? <p className="error-text field-error-text">{fieldErrors.termSeason}</p> : null}
        {fieldErrors.termYear ? <p className="error-text field-error-text">{fieldErrors.termYear}</p> : null}

        {error ? <p className="error-text">{error}</p> : null}

        <div className="modal-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CourseFormModal;
