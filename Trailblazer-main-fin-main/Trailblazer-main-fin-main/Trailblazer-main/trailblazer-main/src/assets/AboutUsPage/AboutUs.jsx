import React from "react";
import "./AboutUs.css";
import aboutHeaderImage from "../pages/about-header.jpg";
import missionImage from "../pages/mission-image.jpg";
import member1 from "../pages/img/Mona.jpg";
import member2 from "../pages/img/Kryzl.jpg";
import member3 from "../pages/img/Raisy.jpg";
import member4 from "../pages/img/Larence.jpg";

export default function AboutUs() {
  return (
    <main className="about-container">
      <section className="about-header">
        <img
          src={aboutHeaderImage}
          alt="Team Working Together"
          className="about-header-img"
          loading="eager"
        />
        <h1 className="about-title">ABOUT US</h1>
      </section>

      <section className="about-intro">
        <p>
          At Trailblazers Printing and Layout Services, we are passionate about
          bringing your ideas to life through high-quality printing and layout
          designs. As USTP students ourselves, we understand the academic and
          creative demands of university life—so we built a service that's fast,
          reliable, and student-friendly.
        </p>
        <p>
          Whether you need project prints, tarpaulins, research layouts, or
          custom designs, Trailblazers is here to help you present your work at
          its best. We aim to be the go-to printing partner for the USTP
          community by offering affordable rates, campus-based convenience, and
          creative solutions that match your needs.
        </p>
        <p>
          Trailblazers isn't just a business—it's a student-led initiative to
          support fellow Trailblazers like you. Let's create something great
          together!!
        </p>
      </section>

      <section className="about-mission">
        <img
          src={missionImage}
          alt="Students Collaborating"
          className="about-mission-img"
          loading="lazy"
        />
        <div className="about-mission-text">
          <h2>Mission</h2>
          <p>
            Our mission is to provide affordable, high-quality, and reliable
            printing and layout services that empower USTP students to present
            their academic and creative work with excellence and confidence.
          </p>
        </div>
      </section>

      <section className="about-goals" aria-labelledby="goals-heading">
        <div className="about-goals-box">
          <h3 id="goals-heading">Our Goals</h3>
          <ul>
            <li>
              To support students with fast, helpful, friendly, and high-quality
              printing
            </li>
            <li>
              To uphold creativity and professionalism in graphic outputs
              through well-designed layouts
            </li>
            <li>
              To offer reliable customer service that understands and responds
              to the needs of fellow students
            </li>
          </ul>
        </div>
      </section>

      <section className="about-team" aria-labelledby="team-heading">
        <h3 id="team-heading" className="team-title">
          Team <span>Members</span>
        </h3>
        <div className="team-cards">
          <img src={member1} alt="Mona - Team Member" className="team-card" loading="lazy" />
          <img src={member2} alt="Kryzl - Team Member" className="team-card" loading="lazy" />
          <img src={member3} alt="Raisy - Team Member" className="team-card" loading="lazy" />
          <img src={member4} alt="Larence - Team Member" className="team-card" loading="lazy" />
        </div>
        <p className="team-description">
          We are a team of driven and creative USTP students committed to
          serving the printing and layout needs of our campus community with
          passion and purpose.
        </p>
      </section>
    </main>
  );
}
