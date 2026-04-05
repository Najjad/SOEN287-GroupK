import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import CategoryBuilder from "../components/CategoryBuilder";
import { createCourseTemplate, fetchCourseTemplates } from "../api/users";
import { deleteCourseTemplate } from "../api/users";

function Templates() {
  const { user } = useContext(AuthContext);
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const totalWeight = useMemo(
    () => categories.reduce((sum, category) => sum + Number(category.weight || 0), 0),
    [categories]
  );

  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        setError("");
        const response = await fetchCourseTemplates();
        setTemplates(response.templates || []);
      } catch (err) {
        setError(err.message || "Unable to load templates");
      } finally {
        setIsLoading(false);
      }
    }

    loadTemplates();
  }, []);
  const handleDeleteTemplate = async (templateId) => {
  if (!window.confirm("Delete this template?")) return;

  try {
    await deleteCourseTemplate(templateId);

    setTemplates((prev) =>
      prev.filter((template) => template.id !== templateId)
    );
  } catch (err) {
    setError(err.message || "Failed to delete template");
  }
};
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setError("Template name is required");
      return;
    }

    if (!categories.length) {
      setError("Add at least one assessment category");
      return;
    }

    if (totalWeight !== 100) {
      setError("Template category weights must add up to 100%");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      const response = await createCourseTemplate({
        name: templateName,
        description,
        categories,
      });

      setTemplates((current) => [response.template, ...current]);
      setTemplateName("");
      setDescription("");
      setCategories([]);
      setSuccessMessage(`${response.template.name} was saved and is ready for students to use.`);
    } catch (err) {
      setError(err.message || "Unable to save template");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div className="card">Please log in to manage templates.</div>;
  }

  return (
    <div className="student-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Reusable Course Templates</p>
          <h1 className="page-title">Course Templates</h1>
          <p className="page-subtitle">
            Save a course structure once, then let students add courses from that template later.
          </p>
        </div>
      </div>

      {successMessage ? <div className="alert-box success-alert">{successMessage}</div> : null}
      {error ? <div className="alert-box error-alert">{error}</div> : null}

      <div className="detail-grid">
        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Create Template</h2>
              <p>Define the reusable structure and assessment weights.</p>
            </div>
          </div>

          <div className="template-form-grid">
            <label className="field-label" htmlFor="template-name">
              Template name
            </label>
            <input
              id="template-name"
              className="input-field"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              placeholder="Software Engineering Core"
            />

            <label className="field-label" htmlFor="template-description">
              Description
            </label>
            <textarea
              id="template-description"
              className="input-field input-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Used for theory-heavy courses with one midterm, final, and coursework."
            />
          </div>

          <CategoryBuilder categories={categories} setCategories={setCategories} />

          <div className="template-summary-row">
            <span>Current total weight: {totalWeight}%</span>
            <button type="button" className="btn-primary" onClick={handleSaveTemplate} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Saved Templates</h2>
              <p>Students can add courses using any structure saved here.</p>
            </div>
          </div>

          {isLoading ? (
            <p>Loading templates...</p>
          ) : templates.length === 0 ? (
            <div className="empty-state">
              <p>No templates saved yet.</p>
              <p className="summary-helper">Create one on the left to make it reusable across student accounts.</p>
            </div>
          ) : (
            <div className="template-list">
              {templates.map((template) => (
                <article key={template.id} className="template-card">
                  <div>
                 <div className="template-card-header">
                  <h3>{template.name}</h3>
                  {template.description ?<p>{template.description}</p> : null}
                  </div>
                  <div>
                    <span className="Status-chip pending">
                      {template.categories?.length||0} categories
                    </span>
                   <button 
                   className="btn-secondary"
                   onClick={()=>handleDeleteTemplate(template.id)}
                   style={{marginleft:"10px"}}
                   >delete
                   </button>
                  </div>



                  
                 </div>

                  <div className="template-category-list">
                    {(template.categories || []).map((category) => (
                      <div key={category.id || category.name} className="template-category-row">
                        <span>{category.name}</span>
                        <strong>{category.weight}%</strong>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Templates;
