import { useState } from "react";
import "./styles/RegisterForm.css"

export default function RegisterForm({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Registration successful! You can now log in.");
        setTimeout(() => onRegister(), 2000); //Call a function to redirect to login after 2000ms
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  return (
    <div>
      <form id="registerForm" onSubmit={handleSubmit}>
        <p class="title text">SIGN UP</p>
        <input
          id="emailInput"
          class="textInput"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          class="textInput"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button id="registerButton" type="submit">Register</button>
        <p class="text">Already have an account? <a href="/login">Login here</a></p>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
