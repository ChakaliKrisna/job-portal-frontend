import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import JobPortal from "./components/JobList";
import CompanySection from "./components/CompanySection";
import InternshipsPage from "./components/Internship";
// import About from "./components/About";

import Register from "./pages/Register";
import Login from "./pages/Login";

import JobDetails from "./components/JobDetails";
import CompanyDetails from "./components/CompanyDetails";
import ApplyJob from "./components/ApplyJob";

import MyApplications from "./pages/MyApplications";
import ApplicationDetails from "./pages/ApplicationDetails";
import UserDashboard from "./pages/Dashboard";

import Navbar from "./components/Navbar";

import RecruiterDashboard from "./pages/recruter/RecruiterDashBoard";
import RecruiterNavbar from "./components/recruter/RecruterNavbar";
import ManageJobs from "./pages/recruter/ManageJobs";
import Myjobs from "./pages/recruter/Myjobs";
import RecruiterMyApplications from "./pages/recruter/RecruiterMyApplications";
import SearchTalent from "./pages/recruter/Searchtalent";
import CompanyProfile from "./pages/recruter/CompanyProfile";
import CompanyCarousel  from "./components/CompanySection";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
const isRecruiter =
  role === "ROLE_RECRUITER" ||
  role === "RECRUITER";

const isStudent =
  role === "ROLE_STUDENT" ||
  role === "STUDENT";

  return (
    <>
      {/* Navbar */}
      {isRecruiter ? <RecruiterNavbar /> : <Navbar />}

      <Routes>

        {/* ================= HOME ================= */}

        <Route
          path="/"
          element={
            isRecruiter ? (
              <Navigate to="/recruiter-dashboard" replace />
            ) : (
              <Home />
            )
          }
        />

        {/* ================= PUBLIC ROUTES ================= */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />

        <Route path="/jobs" element={<JobPortal />} />

        <Route
          path="/job/:jobPublicId"
          element={<JobDetails />}
        />

        <Route
          path="/companies"
          element={<CompanySection />}
        />

        <Route
          path="/companies/:companyPublicId"
          element={<CompanyDetails />}
        />

        <Route
          path="/internships"
          element={<InternshipsPage />}
        />

        {/* ================= STUDENT ROUTES ================= */}

        <Route
          path="/dashboard"
          element={
            isStudent ? (
              <UserDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isStudent ? (
              <UserDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/apply/:jobId"
          element={
            isStudent ? (
              <ApplyJob />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/applications"
          element={
            isStudent ? (
              <MyApplications />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/applications/:applicationId"
          element={
            isStudent ? (
              <ApplicationDetails />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ================= RECRUITER ROUTES ================= */}

        <Route
          path="/recruiter-dashboard"
          element={
            isRecruiter ? (
              <RecruiterDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/post-job"
          element={
            isRecruiter ? (
              <ManageJobs />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/manage-jobs"
          element={
            isRecruiter ? (
              <Myjobs />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/recruiter/applications"
          element={
            isRecruiter ? (
              <RecruiterMyApplications />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/recruiter/search-talent"
          element={
            isRecruiter ? (
              <SearchTalent />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/company-profile"
          element={
            isRecruiter ? (
              <CompanyProfile />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ================= FALLBACK ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
        {/* <Route path="/" element={<CompanyCarousel />} /> */}
        
        {/* DYNAMIC COMPANY ROUTE LINKED HERE */}
        <Route path="/company/:companyPublicId" element={<CompanyDetails />} />
        <Route
  path="/forgot-password"
  element={<ForgotPassword />}

/>
<Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </>
  );
}

export default App;