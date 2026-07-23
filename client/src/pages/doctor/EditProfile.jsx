import "./EditProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDoctorProfile,
  updateDoctorProfile,
} from "../../services/DoctorApi";

function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getDoctorProfile();
        setFormData({
          phoneNumber: res.data.doctor.phoneNumber || "",
          address: res.data.doctor.address || "",
        });
      } catch (error) {
        console.error(error);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoctorProfile(formData);
      alert("Profile Updated Successfully");
      navigate("/doctor/workspace", { replace: true });
    } catch (error) {
      console.error(error);
      alert("Unable to update profile");
    }
  };

  return (
    <div className="edit-profile-container">
      <form className="edit-profile-card" onSubmit={handleSubmit}>
        <h1>Edit Doctor Profile</h1>
        <label>Phone Number</label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
        />
        <label>Address</label>
        <textarea
          name="address"
          rows="4"
          value={formData.address}
          onChange={handleChange}
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export default EditProfile;
