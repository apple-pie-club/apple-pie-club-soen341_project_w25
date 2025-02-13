import { useRouter } from "next/router";
import "./styles/Dashboard.css";
import { CiLogout } from "react-icons/ci";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  return <button id="logoutButton"onClick={handleLogout}><CiLogout /> Logout</button>;
}
