import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Layout.css";
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



function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const navigate = useNavigate();

  const resumeTemplates = [
    {
      id: "resume1",
      src: resume1,
      title: "Professional Resume",
      description: "2024 • A4",
    },
    {
      id: "resume2",
      src: resume2,
      title: "Modern Resume",
      description: "2024 • A4",
    },
    {
      id: "resume3",
      src: resume3,
      title: "Simple Resume",
      description: "2024 • A4",
    },
    {
      id: "resume4",
      src: resume4,
      title: "Creative Resume",
      description: "2024 • A4",
    },
  ];

  const posterTemplates = [
    {
      id: "poster1",
      src: poster1,
      title: "Back to School Poster",
      description: "2024 • A4",
    },
    {
      id: "poster2",
      src: poster2,
      title: "Engineer Poster",
      description: "2024 • A4",
    },
    {
      id: "poster3",
      src: poster3,
      title: "Class Schedule Poster",
      description: "2024 • A4",
    },
    {
      id: "poster4",
      src: poster4,
      title: "Nature Theme Poster",
      description: "2024 • A4",
    },
  ];

  const pptTemplates = [
    {
      id: "ppt1",
      src: ppt1,
      title: "Minimal Aesthetic Presentation",
      description: "2024 • 16:9",
    },
    {
      id: "ppt2",
      src: ppt2,
      title: "Construction Labor Presentation",
      description: "2024 • 16:9",
    },
    {
      id: "ppt3",
      src: ppt3,
      title: "Notebook Style Slides",
      description: "2024 • 16:9",
    },
  ];

    const layoutTemplates = [
    {
      id: "layout1",
      src: "layout1.png",
      title: "Basic Layout Design",
      description: "Simple layout design service",
      templateType: "layout",
    },
    {
      id: "layout2",
      src: "layout2.png",
      title: "Advanced Layout Design",
      description: "Complex layout design service",
      templateType: "layout",
    },
    {
      id: "layout3",
      src: "layout3.png",
      title: "Custom Layout Design",
      description: "Fully customized layout design",
      templateType: "layout",
    },
  ];

const renderTemplates = (templates) =>
  templates.map((template, index) => (
    <div
      className="template-box"
      key={index}
      onClick={() => {
        console.log("Selected template:", template);
        setSelectedTemplate(template);
      }}
    >
      <img src={template.src} alt={template.title} />
    </div>
  ));

  return (
    <div className="templates-page">
      <h1 className="section-title">TEMPLATES</h1>

      <div className="template-section">
        <h2 className="template-heading">RESUME</h2>
        <div className="template-row">{renderTemplates(resumeTemplates)}</div>
      </div>

      <div className="template-section">
        <h2 className="template-heading">POSTERS</h2>
        <div className="template-row">{renderTemplates(posterTemplates)}</div>
      </div>

      <div className="template-section">
        <h2 className="template-heading">POWERPOINT PRESENTATIONS</h2>
        <div className="template-row">{renderTemplates(pptTemplates)}</div>
      </div>

      <div className="template-section">
        <h2 className="template-heading">LAYOUT DESIGNS</h2>
        <div className="template-row">{renderTemplates(layoutTemplates)}</div>
      </div>


      {selectedTemplate && (
        <div
          className="template-modal-overlay"
          onClick={() => setSelectedTemplate(null)}
        >
          <div className="template-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="template-close-btn"
              onClick={() => setSelectedTemplate(null)}
            >
              ×
            </button>
            <div className="template-modal-content">
              <img
                src={selectedTemplate.src}
                alt={selectedTemplate.title}
              />
              <div className="template-info">
                <h3>{selectedTemplate.title}</h3>
                <p>{selectedTemplate.description}</p>
                <button
                  className="choose-template-btn"
                  onClick={() => {
                    console.log(
                      "Navigating to template detail with ID:",
                      selectedTemplate.id
                    );
                    navigate(`/template/${selectedTemplate.id}`);
                  }}
                >
                  Choose this template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Templates;
