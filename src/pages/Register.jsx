import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Register() {

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {

      const success =
        await register({
          role,
          email,
          password
        });

      if (!success) {
        setError("Registration failed");
        return;
      }

      navigate("/dashboard");

    } catch (err) {

      console.error(err);

      setError("Server error");

    }

  };

  return (
    <div className="center-page">
      <h2>Register</h2>

      <form onSubmit={handleSubmit} className="form">

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
        >
          <option value="student">
            Student
          </option>

          <option value="admin">
            Admin
          </option>
        </select>

        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <button type="submit">
          Register
        </button>

      </form>
    </div>
  );
}

export default Register;