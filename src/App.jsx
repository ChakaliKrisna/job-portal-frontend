import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import JobList from "./components/JobList";
import CompanySection from "./components/CompanySection";
import InternshipsPage from "./components/Internship";
import About from "./components/About";
import Register from "./pages/Register";
import Login from "./pages/Login";
import JobDetails from "./components/JobDetails";
import MyApplications from "./pages/MyApplications";
import UserDashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";

function App() {
  const mockJobs = [
  { 
    id: 1, 
    title: "Frontend Developer", 
    company: "Google", 
    location: "Hyderabad", 
    salary: "12 - 18 LPA", 
    type: "Full Time",
    posted: "2 hours ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Reference_icon.png",
    skills: ["React", "Tailwind", "JavaScript"],
    description: "Build next-gen search interfaces. Requires experience with React and modern CSS frameworks."
  },
  { 
    id: 2, 
    title: "Java Backend Intern", 
    company: "Tsar IT", 
    location: "Remote", 
    salary: "15k - 20k /mo", 
    type: "Internship",
    posted: "Just now",
    logo: "https://cdn-icons-png.flaticon.com/512/5968/5968282.png", 
    skills: ["Java", "Spring Boot", "MySQL"],
    description: "Join a fast-paced team building enterprise Java applications. Remote-friendly environment."
  },
  { 
    id: 3, 
    title: "Full Stack Engineer", 
    company: "Amazon", 
    location: "Bangalore", 
    salary: "20 - 25 LPA", 
    type: "Full Time",
    posted: "5 hours ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png",
    skills: ["Node.js", "React", "AWS"],
    description: "Help scale global e-commerce systems. Focus on performance and high-availability systems."
  },
  { 
    id: 4, 
    title: "UI/UX Design Intern", 
    company: "Microsoft", 
    location: "Mumbai", 
    salary: "30k /mo", 
    type: "Internship",
    posted: "1 day ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    skills: ["Figma", "Adobe XD", "Prototyping"],
    description: "Design beautiful interfaces for millions of users. Work closely with product and engineering teams."
  },
  { 
    id: 5, 
    title: "Software Engineer", 
    company: "Flipkart", 
    location: "Bangalore", 
    salary: "15 - 22 LPA", 
    type: "Full Time",
    posted: "3 hours ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Flipkart_logo.png",
    skills: ["Java", "Distributed Systems"],
    description: "Optimizing the logistics and supply chain systems for India's leading e-commerce site."
  }
];
const MOCK_INTERNSHIPS = [
  {
    id: 1,
    title: "Java Backend Intern",
    company: "TechNova Solutions",
    location: "Remote",
    stipend: "₹15,000/mo",
    type: "Internship"
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "CloudScale Inc.",
    location: "Bangalore",
    stipend: "₹25,000/mo",
    type: "Internship"
  },
  {
    id: 3,
    title: "UI/UX Design Intern",
    company: "Creative Pulse",
    location: "Remote",
    stipend: "Unpaid",
    type: "Internship"
  },
  {
    id: 4,
    title: "Data Analyst Intern",
    company: "Insight Data",
    location: "Hyderabad",
    stipend: "₹20,000/mo",
    type: "Internship"
  },
  {
    id: 5,
    title: "Marketing Strategy",
    company: "Growth Hackers",
    location: "Mumbai",
    stipend: "₹12,000/mo",
    type: "Internship"
  },
  {
    id: 6,
    title: "React.js Intern",
    company: "Vite Flow",
    location: "Remote",
    stipend: "₹18,000/mo",
    type: "Internship"
  }
];
  return (
    <>
      <Navbar />
    
    <Routes>
      {/* 1. Main Home Route - ONE definition with all data */}
    
      <Route 
        path="/" 
        element={<Home jobs={mockJobs} internships={MOCK_INTERNSHIPS} />} 
      />

      {/* 2. Internships Page */}
      <Route 
        path="/internships" 
        element={<InternshipsPage data={MOCK_INTERNSHIPS} />} 
      />

      {/* 3. Jobs Page - usually redirects to a list or the same Home component */}
      <Route 
        path="/jobs" 
        element={<JobList data={mockJobs} />} 
      />

      {/* 4. Details Pages */}
      <Route path="/job/:id" element={<JobDetails jobs={mockJobs} />} />
      <Route path="/internship/:id" element={<JobDetails jobs={MOCK_INTERNSHIPS} />} />

      {/* 5. Static Pages */}
      <Route path="/companies" element={<CompanySection />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* 5. Applications Tracker (Table View) */}
         <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/profile" element={<UserDashboard />} />
      <Route path="/applications" element={<MyApplications />} />
    </Routes>
      </>
  );

}
export default App;
