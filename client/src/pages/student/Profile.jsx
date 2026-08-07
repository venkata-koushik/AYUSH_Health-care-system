import "./Profile.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudentProfile } from "../../services/StudentApi";
import { SkeletonList } from "../../components/Skeleton";

function Profile() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getStudentProfile();
        setStudent(res.data.student);
      } catch (error) {
        console.error(error);
      }
    };

    loadProfile();
  }, []);

  if (!student) {
    return (
      <div className="profile-container">
        <SkeletonList count={1} lines={6} label="Loading profile" />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-top">
          <img
            src={student.profilePhoto || "https://placehold.co/140x140"}
            alt="Student"
          />
          <div>
            <h1>{student.name}</h1>
            <p>{student.instituteName}</p>
            <p>{student.collegeEmail}</p>
          </div>
        </div>

        <div className="profile-info">
          <p>
            <strong>Phone:</strong> {student.phoneNumber}
          </p>
          <p>
            <strong>Approval:</strong> {student.approvalStatus}
          </p>
          <p>
            <strong>Available:</strong> {student.isAvailable ? "Yes" : "No"}
          </p>
          <p>
            <strong>Languages:</strong>{" "}
            {student.languages?.join(", ") || "Not Added"}
          </p>
          <p>
            <strong>Bio:</strong> {student.bio || "No Bio"}
          </p>
          <p>
            <strong>Average Rating:</strong> ⭐{" "}
            {(Number(student.averageRating) || 0).toFixed(1)} (
            {student.totalReviews || 0} reviews)
          </p>
          <p>
            <strong>Patients Helped:</strong> {student.patientsHelped || 0}
          </p>
          <p>
            <strong>Doctor Referrals:</strong> {student.doctorReferrals || 0}
          </p>
        </div>

        <Link className="edit-btn" to="/student/edit-profile">
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

export default Profile;
