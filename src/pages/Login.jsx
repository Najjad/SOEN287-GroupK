import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIXED: async login handling
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear old error
    setError("");

    // Validation
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {

      // Call backend login
      setIsSubmitting(true);
      const loggedInUser = await login(email, password);

      // Redirect on success
      navigate(loggedInUser.role === "admin" ? "/admin" : "/dashboard");

    } catch (err) {

      console.error("Login error:", err);

      setError(err.message || "Server error. Try again.");

    } finally {
      setIsSubmitting(false);

    }
  };

  return (
    <div className="center-page">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Login"}
        </button>
      </form>

      <p>Test accounts:</p>
      <p>student@test.com / 1234</p>
      <p>admin@test.com / 1234</p>
    </div>
  );
}

export default Login;
