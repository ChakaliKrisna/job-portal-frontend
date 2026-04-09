import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/jobs?title=${title}&location=${location}&experience=${experience}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex space-x-3">
      <input type="text" placeholder="Job title" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 border px-3 py-2 rounded"/>
      <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="flex-1 border px-3 py-2 rounded"/>
      <input type="text" placeholder="Experience" value={experience} onChange={(e) => setExperience(e.target.value)} className="flex-1 border px-3 py-2 rounded"/>
      <button onClick={handleSearch} className="bg-blue-600 text-white px-5 py-2 rounded">Search</button>
    </div>
  );
}
