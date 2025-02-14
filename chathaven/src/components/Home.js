import { useRouter } from "next/navigation";
import LogoutButton from "@/src/components/LogoutButton";
import "./styles/Dashboard.css";
import "./styles/Home.css";

export default function HomePage() {
  const router = useRouter();

  return (
    <div>
      <div id="mainArea">
        <h1 id="text">
          ChatHaven
        </h1>
        <div>
          <p id="text"><br/>Welcome to ChatHaven! <br/>You are logged in. Access your dashboard below:</p>
        </div>
        <div id="centered">
          <button
            onClick={() => router.push('/dashboard')}
            id="button"
          >
            Dashboard
          </button>
        </div>
        <div>
          <p id="text"><br/>Or register a new account:</p>
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
        <LogoutButton />
      </div>
    </div>
  );
}