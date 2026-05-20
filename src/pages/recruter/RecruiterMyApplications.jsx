import { useEffect, useState } from "react";
import axios from "axios";

export default function RecruiterMyApplications() {

    // =========================================================
    // STATE
    // =========================================================

    const [applications, setApplications] = useState([]);

    const [jobs, setJobs] = useState([]);

    const [selectedJob, setSelectedJob] = useState("");

    const [keyword, setKeyword] = useState("");
    const [skill, setSkill] = useState("");
    const [status, setStatus] = useState("");
    const [minScore, setMinScore] = useState("");

    const [page, setPage] = useState(0);
    const [size] = useState(5);

    const [totalPages, setTotalPages] = useState(0);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    // =========================================================
    // FETCH RECRUITER JOBS
    // =========================================================

    const fetchJobs = async () => {

        try {

            const res = await axios.get(
                "http://localhost:8080/job-portal/jobs/recruiter/my-jobs",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setJobs(res.data.content || res.data);

        } catch (err) {

            console.log(err);

            setError("Failed to load recruiter jobs");
        }
    };

    // =========================================================
    // FETCH APPLICATIONS
    // =========================================================

    const fetchApplications = async (currentPage = page) => {

        if (!selectedJob) {
            return;
        }

        try {

            setLoading(true);

            setError("");

            const res = await axios.get(
                `http://localhost:8080/job-portal/applications/job/${selectedJob}/filter`,
                {
                    params: {
                        keyword,
                        skill,
                        status,
                        minScore,
                        page: currentPage,
                        size
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setApplications(res.data.content);

            setTotalPages(res.data.totalPages);

            setPage(currentPage);

        } catch (err) {

            console.log(err);

            setError("Failed to fetch applications");

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // UPDATE APPLICATION STATUS
    // =========================================================

    const updateStatus = async (applicationId, newStatus) => {

        try {

            await axios.patch(
                `http://localhost:8080/job-portal/applications/${applicationId}/status`,
                {},
                {
                    params: {
                        status: newStatus
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            fetchApplications(page);

        } catch (err) {

            console.log(err);

            alert("Failed to update status");
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchJobs();

    }, []);

    // =========================================================
    // UI
    // =========================================================

    return (

        <div style={{ padding: "20px" }}>

            <h1>Recruiter Applications Dashboard</h1>

            {/* ================================================= */}
            {/* FILTER SECTION */}
            {/* ================================================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: "10px",
                    marginBottom: "20px"
                }}
            >

                {/* JOB DROPDOWN */}

                <select
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                >

                    <option value="">
                        Select Job
                    </option>

                    {
                        jobs.map(job => (

                            <option
                                key={job.publicId}
                                value={job.publicId}
                            >
                                {job.title}
                            </option>
                        ))
                    }

                </select>

                {/* KEYWORD */}

                <input
                    type="text"
                    placeholder="Resume Keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />

                {/* SKILL */}

                <input
                    type="text"
                    placeholder="Skill"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                />

                {/* STATUS */}

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >

                    <option value="">
                        All Status
                    </option>

                    <option value="APPLIED">
                        Applied
                    </option>

                    <option value="SHORTLISTED">
                        Shortlisted
                    </option>

                    <option value="REJECTED">
                        Rejected
                    </option>

                    <option value="INTERVIEW">
                        Interview
                    </option>

                </select>

                {/* SCORE */}

                <input
                    type="number"
                    placeholder="Min Score"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                />

                {/* SEARCH BUTTON */}

                <button
                    onClick={() => fetchApplications(0)}
                >
                    Search
                </button>

            </div>

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {
                error && (

                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )
            }

            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {
                loading && (

                    <p>
                        Loading applications...
                    </p>
                )
            }

            {/* ================================================= */}
            {/* EMPTY STATE */}
            {/* ================================================= */}

            {
                !loading &&
                applications.length === 0 &&
                selectedJob && (

                    <p>
                        No applications found
                    </p>
                )
            }

            {/* ================================================= */}
            {/* APPLICATION LIST */}
            {/* ================================================= */}

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px"
                }}
            >

                {
                    applications.map(app => (

                        <div
                            key={app.applicationId}
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "10px",
                                padding: "15px"
                            }}
                        >

                            {/* NAME */}

                            <h2>
                                {app.candidateName}
                            </h2>

                            {/* EMAIL */}

                            <p>
                                <strong>Email:</strong> {app.email}
                            </p>

                            {/* SCORE */}

                            <p>
                                <strong>ATS Score:</strong> {app.matchScore}
                            </p>

                            {/* STATUS */}

                            <p>
                                <strong>Status:</strong> {app.status}
                            </p>

                            {/* SKILLS */}

                            <div>

                                <strong>Skills:</strong>

                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "8px",
                                        marginTop: "10px"
                                    }}
                                >

                                    {
                                        app.skills?.map(skill => (

                                            <span
                                                key={skill}
                                                style={{
                                                    background: "#eee",
                                                    padding: "5px 10px",
                                                    borderRadius: "20px"
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    }

                                </div>

                            </div>

                            {/* APPLIED DATE */}

                            <p
                                style={{ marginTop: "15px" }}
                            >
                                <strong>Applied:</strong>{" "}
                                {
                                    new Date(app.appliedAt)
                                        .toLocaleString()
                                }
                            </p>

                            {/* RESUME */}

                            <a
                                href={`http://localhost:8080${app.resumeUrl}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View Resume
                            </a>

                            {/* ACTION BUTTONS */}

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    marginTop: "15px"
                                }}
                            >

                                <button
                                    onClick={() =>
                                        updateStatus(
                                            app.applicationId,
                                            "SHORTLISTED"
                                        )
                                    }
                                >
                                    Shortlist
                                </button>

                                <button
                                    onClick={() =>
                                        updateStatus(
                                            app.applicationId,
                                            "REJECTED"
                                        )
                                    }
                                >
                                    Reject
                                </button>

                                <button
                                    onClick={() =>
                                        updateStatus(
                                            app.applicationId,
                                            "INTERVIEW"
                                        )
                                    }
                                >
                                    Interview
                                </button>

                            </div>

                        </div>
                    ))
                }

            </div>

            {/* ================================================= */}
            {/* PAGINATION */}
            {/* ================================================= */}

            {
                totalPages > 0 && (

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "10px",
                            marginTop: "30px"
                        }}
                    >

                        <button
                            disabled={page === 0}
                            onClick={() =>
                                fetchApplications(page - 1)
                            }
                        >
                            Prev
                        </button>

                        <span>
                            Page {page + 1} of {totalPages}
                        </span>

                        <button
                            disabled={page + 1 >= totalPages}
                            onClick={() =>
                                fetchApplications(page + 1)
                            }
                        >
                            Next
                        </button>

                    </div>
                )
            }

        </div>
    );
}