import React from "react";
import "./How It Works.css";
import upload from "./upload-printing-icon.png";
import print from "./printing-icon.png";
import deliver from "./deliver-icon.png";
import get from "./get-print-icon.png";
import choose from "./template-icon.png";
import modify from "./modify-icon.png";
import getLayout from "./get-print-icon.png";

function HowItWorks() {
  return (
    <section className="HowItWorks">
      <div className="content">
        <h1 className="heading">HOW IT WORKS</h1>
        <h2 className="subheading1">Printing Service</h2>
        <div className="printing-circles">
          <div className="services-feature-container">
            <div className="circle1">
              <div className="upload">
                <img src={upload} alt="upload your files icon" />
              </div>
            </div>
            <h2 className="printing-subtext1">Upload Your Files</h2>
            <div className="upload-text">
              <p className="feature-description">
                Send us your files through our order form make sure to include
                the size, number of copies, and other specifications.
              </p>
            </div>
          </div>

          <div className="services-feature-container">
            <div className="circle2">
              <div className="printing">
                <img src={print} alt="printing icon for how it works" />
              </div>
            </div>
            <h2 className="printing-subtext2">Print</h2>
            <div className="printing-text">
              <p className="feature-description">
                Once we receive your request, we'll prepare and print your order
                using high-quality materials and equipment.
              </p>
            </div>
          </div>

          <div className="services-feature-container">
            <div className="circle3">
              <div className="delivery">
                <img src={deliver} alt="Pickup or deliver icon" />
              </div>
            </div>
            <h2 className="printing-subtext3">Pickup or Deliver</h2>
            <div className="delivery-text">
              <p className="feature-description">
                Choose to pick up your print at our campus location or have it
                delivered if available.
              </p>
            </div>
          </div>

          <div className="services-feature-container">
            <div className="circle4">
              <div className="get-print">
                <img src={get} alt="Get your print icon" />
              </div>
            </div>
            <h2 className="printing-subtext4">Get Your Print</h2>
            <div className="get-print-text">
              <p className="feature-description">
                Receive your printed output fast, clean, and ready to go!
              </p>
            </div>
          </div>
        </div>

        <h2 className="subheading2">Layout Service</h2>
        <div className="layout-circles">
          <div className="services-feature-container">
            <div className="circle5">
              <div className="choose-layout">
                <img src={choose} alt="Choose your template icon" />
              </div>
            </div>
            <h2 className="layout-subtext1">Choose Your Template</h2>
            <div className="choose-text">
              <p className="feature-description">
                Pick from our available layout templates or let us know if you
                want a custom design.
              </p>
            </div>
          </div>

          <div className="services-feature-container">
            <div className="circle6">
              <div className="modify-layout">
                <img src={modify} alt="Modify your template icon" />
              </div>
            </div>
            <h2 className="layout-subtext2">Modify Your Template</h2>
            <div className="modify-text">
              <p className="feature-description">
                Send us your content (text, images, logos, etc.), and we'll
                customize the template to match your project needs.
              </p>
            </div>
          </div>

          <div className="services-feature-container">
            <div className="circle7">
              <div className="get-layout">
                <img src={getLayout} alt="Get your layout icon" />
              </div>
            </div>
            <h2 className="layout-subtext3">Get Your Layout</h2>
            <div className="get-layout-text">
              <p className="feature-description">
                We'll send you the final layout file, ready for printing or
                submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default HowItWorks;
