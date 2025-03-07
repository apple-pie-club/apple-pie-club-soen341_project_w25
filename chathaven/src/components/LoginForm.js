import { useState } from "react";
import { useRouter } from "next/router";
import Link from 'next/link';
import "./styles/LoginForm.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
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
        credentials: "include", // Important for sending cookies
      });

      if (res.ok) {
        router.push("/dashboard"); // Redirect after login
      } else {
        const data = await res.json();
        showErrorMessage(data.message);
      }
    } catch (error) {
      console.log(error);
      showErrorMessage("Something went wrong.");
    }
  };
  const showErrorMessage = (message) => {
    setError(message);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  return (
    <div>
      <form id="loginForm" onSubmit={handleSubmit}>
        <p id="loginText">LOGIN</p>
        <input
          className="textInput"
          id="emailInput"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="textInput"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button id="loginButton" type="submit">Login</button>
        <p className="text">Want to make an account? <Link href="/register">Register one here</Link></p>
      </form>
      {showError && 
        <div className={`alert ${showError ? "show" : ""}`}>
          <p className="error">{error}</p>
        </div>}
    </div>
  );
}
