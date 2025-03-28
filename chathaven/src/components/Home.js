import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./styles/Home.css";
import { CiLogout } from "react-icons/ci";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("User Data for Admin:", data);
        if (data && typeof data.isGlobalAdmin !== "undefined") {
          setUser(data);
        } else {
          console.warn("isGlobalAdmin field not found in user data!");
        }
      })
      .catch((error) => console.error("Error fetching user data:", error))
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  return (
    <div>
      <div id="mainArea">
        <h1 id="text">
          ChatHaven
        </h1>
        <div>
          <p id="text"><br />Welcome to ChatHaven! <br />You are logged in as {user?.firstname} {user?.lastname}:</p>
        </div>
        <div id="centered">
          <button
            onClick={() => router.push('/dashboard')}
            id="button"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push('/dms')}
            id="button"
          >
            DMs
          </button>
        </div>
        <div>
          <p id="text"><br />Or register a new account:</p>
        </div>
        <div id="centered">
          <button
            onClick={() => router.push('/register')}
            id="button"
          >
            Register
          </button>
        </div>
      </div>
      <div id="logoutButtonArea">
        <button id="logoutButton" data-testid="logout-button" onClick={handleLogout}><CiLogout /></button>
      </div>
    </div>
  );
}