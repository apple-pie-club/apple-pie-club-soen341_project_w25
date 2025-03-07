import { useState } from "react";
import "./styles/RegisterForm.css"
import Link from 'next/link';

export default function RegisterForm({ onRegister }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requestGlobalAdmin, setRequestGlobalAdmin] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);


  const showErrorMessage = (message) => {
    setError(message);
    setShowError(true);
    
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  const showSuccessMessage = ()=>{
    setShowSuccess(true);

    setTimeout(() =>{
      setShowSuccess(false);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
        showSuccessMessage();
        setTimeout(() => onRegister(), 2000); // Call a function to redirect to login after 2000ms
      } else {
        showErrorMessage(data.message);
      }
    } catch (error) {
      console.log(error);
      showErrorMessage("Something went wrong.");
    }
  };

  return (
    <div>
      <form id="registerForm" onSubmit={handleSubmit}>
        <p id="loginText">SIGN UP</p>
        <input
          className="textInput"
          type="text"
          placeholder="First Name"
          name="name"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        />
        <input
          className="textInput"
          type="text"
          placeholder="Last Name"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        />
        <input
          className="textInput"
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
        <label className="checkboxLabel">
          <input
            type="checkbox"
            checked={requestGlobalAdmin}
            onChange={(e) => setRequestGlobalAdmin(e.target.checked)}
          />
          <span className="checkmark"></span>
          <p className="text">Request Global Admin Status</p>
        </label>
        <button id="registerButton" type="submit">Register</button>
        <p className="text">Already have an account? <Link href="/login">Login here</Link></p>
      </form>
      {showError && 
        <div className={`alert ${showError ? "show" : ""}`}>
          <p className="error">{error}</p>
        </div>}

      {showSuccess &&
        <div className={`success ${showSuccess ? "show" : ""}`}>
          <p className="successMessage">User successfully registered</p>
        </div>
      }

    </div>
  );
}
