import { useState } from "react";
import "./styles/RegisterForm.css"

export default function RegisterForm({ onRegister }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requestGlobalAdmin, setRequestGlobalAdmin] = useState(false);
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
        body: JSON.stringify({ firstname, lastname, email, password, requestGlobalAdmin }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Registration successful! You can now log in.");
        setTimeout(() => onRegister(), 2000); // Call a function to redirect to login after 2000ms
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
        <p id="loginText">SIGN UP</p>
        <input
          class="textInput"
          type="text"
          placeholder="First Name"
          name="name"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        />
        <input
          class="textInput"
          type="text"
          placeholder="Last Name"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        />
        <input
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
        <label class="checkboxLabel">
          <input
            type="checkbox"
            checked={requestGlobalAdmin}
            onChange={(e) => setRequestGlobalAdmin(e.target.checked)}
          />
          <span class="checkmark"></span>
          <p class="text">Request Global Admin Status</p>
        </label>
        <button id="registerButton" type="submit">Register</button>
        <p class="text">Already have an account? <a href="/login">Login here</a></p>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
