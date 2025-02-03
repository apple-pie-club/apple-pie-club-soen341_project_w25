import { useState } from "react";
import { useRouter } from "next/router";
import { setAuthToken } from "@/utils/auth";
import "./styles/LoginForm.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setAuthToken(data.token); // Store token
        router.push("/dashboard"); // Redirect after login
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  return (
    <div>
      <form id="loginForm" onSubmit={handleSubmit}>
        <p id="loginText">LOGIN</p>
        <input
          class="textInput"
          id="emailInput"
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
        <button id="loginButton" type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
