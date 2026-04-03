import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchUserByEmail } from "../api/users";

export default function Account() {
  const { user, updateUserEmail } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch latest user data from backend
  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchUserByEmail(user.email)
      .then((data) => {
        setCurrentUser(data);
        setNewEmail(data.email);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to fetch user");
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <p>Please log in to view your account.</p>;
  if (loading) return <p>Loading account...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    try {
      const updated = await updateUserEmail(newEmail);
      setCurrentUser(updated);
      setSuccess("Email updated successfully!");
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update email");
      setSuccess("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Account</h2>
      <p>This is where users can view and edit their account details.</p>

      <p>
        <strong>Role:</strong> {currentUser.role}
      </p>

      <form onSubmit={handleUpdateEmail}>
        <label>
          <strong>Email:</strong>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            style={{ marginLeft: "10px" }}
          />
        </label>
        <button type="submit" style={{ marginLeft: "10px" }}>
          Update Email
        </button>
      </form>

      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}