import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./TemplateDetail.css";
import BackButton from "../../components/BackButton/BackButton";
import resume1 from "../pages/img/resumeTemplates/resume1.png";
import resume2 from "../pages/img/resumeTemplates/resume2.png";
import resume3 from "../pages/img/resumeTemplates/resume3.png";
import resume4 from "../pages/img/resumeTemplates/resume4.png";
import poster1 from "../pages/img/posterTemplates/poster1.png";
import poster2 from "../pages/img/posterTemplates/poster2.png";
import poster3 from "../pages/img/posterTemplates/poster3.png";
import poster4 from "../pages/img/posterTemplates/poster4.png";
import ppt1 from "../pages/img/pptTemplates/ppt1.png"
import ppt2 from "../pages/img/pptTemplates/ppt2.png"
import ppt3 from "../pages/img/pptTemplates/ppt3.png"
function TemplateDetail() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const previousTemplateInfo = location.state?.templateInfo || {};
  const [notes, setNotes] = useState(previousTemplateInfo.notes || "");
  const [turnaroundTime, setTurnaroundTime] = useState(
    previousTemplateInfo.turnaroundTime || ""
  );

  const resumeTemplates = [
    { id: "resume1", title: "Professional Resume", description: "2024 • A4", src: resume1 },
    { id: "resume2", title: "Modern Resume", description: "2024 • A4", src: resume2 },
    { id: "resume3", title: "Simple Resume", description: "2024 • A4", src: resume3 },
    { id: "resume4", title: "Creative Resume", description: "2024 • A4", src: resume4 },
  ];

  const posterTemplates = [
    { id: "poster1", title: "Back to School Poster", description: "2024 • A4", src: poster1 },
    { id: "poster2", title: "Engineer Poster", description: "2024 • A4", src: poster2 },
    { id: "poster3", title: "Class Schedule Poster", description: "2024 • A4", src: poster3 },
    { id: "poster4", title: "Nature Theme Poster", description: "2024 • A4", src: poster4 },
  ];

  const pptTemplates = [
    { id: "ppt1", title: "Minimal Aesthetic Presentation", description: "2024 • 16:9", src: ppt1 },
    { id: "ppt2", title: "Construction Labor Presentation", description: "2024 • 16:9", src: ppt2 },
    { id: "ppt3", title: "Notebook Style Slides", description: "2024 • 16:9", src: ppt3 },
  ];

  const layoutTemplates = [
    { id: "layout1", title: "Basic Layout Design", description: "Simple layout design service", src: "layout1.png" },
    { id: "layout2", title: "Advanced Layout Design", description: "Complex layout design service", src: "layout2.png" },
    { id: "layout3", title: "Custom Layout Design", description: "Fully customized layout design", src: "layout3.png" },
  ];

  const allTemplates = [...resumeTemplates, ...posterTemplates, ...pptTemplates, ...layoutTemplates];
  const selectedTemplate = allTemplates.find((t) => t.id === templateId);

  const handleContinue = () => {
    if (!turnaroundTime) {
      alert("Please select a turnaround time before proceeding.");
      return;
    }

    if (!selectedTemplate) {
      alert("Template not found.");
      return;
    }

    let templateType = "other";
    if (templateId.includes("resume")) templateType = "resume";
    else if (templateId.includes("ppt") || templateId.includes("presentation")) templateType = "presentation";
    else if (templateId.includes("poster")) templateType = "poster";
    else if (templateId.includes("layout")) templateType = "layout";

    const templateInfo = {
      templateId,
      notes,
      turnaroundTime,
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      imageSrc: previousTemplateInfo.imageSrc || selectedTemplate.src,
      templateType,
    };

    console.log("Template info being passed to specification page:", templateInfo);

    navigate(`/template/${templateId}/specification`, {
      state: {
        templateInfo,
      },
    });
  };

  const handleBack = () => {
    navigate("/layout", {
      state: {
        templateInfo: {
          templateId,
          notes,
          turnaroundTime,
        },
      },
    });
  };

  const steps = [
    { number: "1", label: "Template", active: true },
    { number: "2", label: "Specifications", active: false },
    { number: "3", label: "Basket", active: false },
    { number: "4", label: "Delivery", active: false },
    { number: "5", label: "Payment", active: false },
  ];

  return (
    <div className="detail-page">
      <BackButton onClick={handleBack} />

      <div className="template-steps">
        <div className="template-step-circles">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {index > 0 && (
                <div className={`template-line ${steps[index - 1].active ? "active" : ""}`}></div>
              )}
              <div className={`template-step-circle ${step.active ? "active" : ""}`}>
                <span className="template-step-num">{step.number}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="template-step-labels">
          {steps.map((step) => (
            <div key={`label-${step.number}`} className="template-step-label">
              {step.label}
            </div>
          ))}
        </div>
      </div>

      <h2 className="template-title">{selectedTemplate?.title || "Selected Template"}</h2>

      <div className="template-detail-content">
        <img
          src={previousTemplateInfo.imageSrc || selectedTemplate?.src}
          alt="Selected Template"
          className="detail-image"
        />

        <div className="template-form-container">
          <div className="template-form">
            <h3>NOTES:</h3>
            <textarea
              placeholder="Specify what you need. e.g. font: arial"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="specification-fields">
              <div className="spec-field turnaround-container">
                <label>Turnaround time:</label>
                <select
                  value={turnaroundTime}
                  onChange={(e) => setTurnaroundTime(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Standard">Standard (3-5 days)</option>
                  <option value="Rush">Rush (1-2 days)</option>
                </select>
              </div>
            </div>
          </div>

          <button className="continue-btn" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateDetail;