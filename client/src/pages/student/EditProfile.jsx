import "./EditProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudentProfile,
  updateStudentProfile,
} from "../../services/StudentApi";

function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    bio: "",
    languages: [],
    isAvailable: true,
  });
  const [loading, setLoading] = useState(true);
  const languageOptions = [
    "English",
    "Hindi",
    "Telugu",
    "Tamil",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Bengali",
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getStudentProfile();
        const student = res.data.student;

        setFormData({
          phoneNumber: student.phoneNumber || "",
          bio: student.bio || "",
          languages: Array.isArray(student.languages) ? student.languages : [],
          isAvailable: student.isAvailable ?? true,
        });
      } catch (error) {
        console.error("Failed to load profile", error);
        alert("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await updateStudentProfile(formData);
      alert("Profile Updated Successfully!");
      navigate("/student/dashboard");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const toggleLanguage = (language) => {
    setFormData((current) => ({
      ...current,
      languages: current.languages.includes(language)
        ? current.languages.filter((item) => item !== language)
        : [...current.languages, language],
    }));
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <form className="edit-profile" onSubmit={save}>
      <h1>Edit Profile</h1>

      <label>Phone Number</label>
      <input
        type="tel"
        value={formData.phoneNumber}
        onChange={(e) =>
          setFormData({ ...formData, phoneNumber: e.target.value })
        }
        required
      />

      <label>Bio</label>
      <textarea
        rows="4"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        placeholder="Tell us about yourself..."
      />

      <fieldset className="language-selector">
        <legend>Languages you can consult in</legend>
        <div className="language-grid">
          {languageOptions.map((language) => (
            <label key={language} className="language-option">
              <input
                type="checkbox"
                checked={formData.languages.includes(language)}
                onChange={() => toggleLanguage(language)}
              />
              {language}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={formData.isAvailable}
          onChange={(e) =>
            setFormData({ ...formData, isAvailable: e.target.checked })
          }
        />
        Available for Consultation
      </label>

      <button type="submit">Save Profile</button>
    </form>
  );
}

export default EditProfile;
