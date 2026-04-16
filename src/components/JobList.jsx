import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaMapMarkerAlt,
  FaWallet,
  FaRegClock,
  FaCheckCircle,
  FaTimes,
  FaCloudUploadAlt,
  FaShieldAlt,
} from "react-icons/fa";

import "./Styles/joblist.css";
import "./Styles/jobDetails.css";

const JOB_API = "http://localhost:8080/job-portal/jobs";
const APPLY_API = "http://localhost:8080/job-portal/applications";

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ FETCH JOBS
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${JOB_API}?page=0&size=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const jobList = res.data.content;

      setJobs(jobList);
      if (jobList.length > 0) {
        setSelectedJob(jobList[0]);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  // ✅ APPLY CLICK
  const handleOpenModal = () => {
    if (!token) {
      alert("Please login first!");
      return;
    }
    setIsModalOpen(true);
  };

  // ✅ APPLY API
  const submitApplication = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(
        `${APPLY_API}/${selectedJob.publicId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppliedJobs((prev) => [...prev, selectedJob.publicId]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Application failed:", err);
      alert("Failed to apply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasApplied = appliedJobs.includes(selectedJob?.publicId);

  return (
    <section className="job-board-section">

      {/* ✅ MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Apply for {selectedJob?.title}</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={submitApplication}>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" required />
              </div>

              <div className="form-group">
                <label>Resume</label>
                <input type="file" />
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Apply"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="job-board-container">

        {/* ✅ LEFT SIDE (JOB LIST) */}
        <div className="job-list-sidebar">
          <h2>Jobs</h2>

          {jobs.map((job) => (
            <div
              key={job.publicId}
              className={`mini-job-card ${
                selectedJob?.publicId === job.publicId ? "active" : ""
              }`}
              onClick={() => setSelectedJob(job)}
            >
              <h4>{job.title}</h4>
              <p>
                {job.company}
                {appliedJobs.includes(job.publicId) && " • Applied"}
              </p>
            </div>
          ))}
        </div>

        {/* ✅ RIGHT SIDE (DETAIL VIEW) */}
        {selectedJob && (
          <div className="job-details-view">
            <div className="job-header">
              <h1>{selectedJob.title}</h1>
              <p>{selectedJob.company}</p>
            </div>

            <div className="meta-stats">
              <p>
                <FaMapMarkerAlt /> {selectedJob.location}
              </p>
              <p>
                <FaWallet /> ₹{selectedJob.salary}
              </p>
              <p>
                <FaRegClock /> {selectedJob.workMode}
              </p>
            </div>

            <div className="job-description-body">
              <h3>Description</h3>
              <p>{selectedJob.description}</p>

              <h3>Skills</h3>
              <p>{selectedJob.skillsRequired}</p>
            </div>

            <div className="sticky-action-bar">
              {!hasApplied ? (
                <button onClick={handleOpenModal} className="btn-primary">
                  Apply Now
                </button>
              ) : (
                <div className="success-badge-large">
                  <FaCheckCircle /> Applied
                </div>
              )}
              <p>
                <FaShieldAlt /> Secure Application
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobBoard;