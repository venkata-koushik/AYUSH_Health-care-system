import "./SearchPatient.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatientDetails } from "../../services/DoctorApi";

function SearchPatient() {
  const navigate = useNavigate();
  const [uhid, setUhid] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!uhid) {
      alert("Enter UHID");
      return;
    }

    try {
      setLoading(true);
      const res = await getPatientDetails(uhid);
      if (res.data.success) {
        navigate(`/doctor/patient/${uhid}`);
      }
    } catch (error) {
      console.error(error);
      alert("Patient not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-card">
        <h1>Search Patient</h1>
        <p>Enter Patient UHID</p>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="UHID20260001"
            value={uhid}
            onChange={(e) => setUhid(e.target.value)}
          />
          <button type="submit">{loading ? "Searching..." : "Search"}</button>
        </form>
      </div>
    </div>
  );
}

export default SearchPatient;
