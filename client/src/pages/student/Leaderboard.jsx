import "./Leaderboard.css";
import { useEffect, useState } from "react";
import { getLeaderboard } from "../../services/StudentApi";

function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLeaderboard();
        setStudents(res.data.students || []);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="leaderboard">
        <h2>Loading Leaderboard...</h2>
      </div>
    );

  return (
    <div className="leaderboard">
      <h1>Top Performing Students</h1>

      {students.length === 0 ? (
        <p>No data available yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th width="10%">Rank</th>
              <th width="40%">Name</th>
              <th width="25%">Total Consultations</th>
              <th width="25%">Rating</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td>
                  {index === 0
                    ? "🥇"
                    : index === 1
                      ? "🥈"
                      : index === 2
                        ? "🥉"
                        : `#${index + 1}`}
                </td>
                <td style={{ fontWeight: "bold", textAlign: "center" }}>
                  {student.name}
                </td>
                <td>
                  {(student.completedChats || 0) +
                    (student.completedVideoCalls || 0)}
                </td>
                <td>
                  ⭐ {(Number(student.averageRating) || 0).toFixed(1)} (
                  {student.totalReviews || 0})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;
