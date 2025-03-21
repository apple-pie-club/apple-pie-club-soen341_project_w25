import { useRouter } from "next/router";
import "./styles/Dashboard.css";
import { useSocket } from "./SocketContext";
import { CiLogout } from "react-icons/ci";

export default function LogoutButton() {
  const router = useRouter();
  const { socket, userId, updateStatus } = useSocket();

  const handleLogout = async () => {
    // Emit status change to "unavailable" before logging out
    if (socket && userId) {
      console.log("Setting status to 'unavailable' for user:", userId);
      updateStatus("unavailable"); // Set the status to 'unavailable'
    }
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  return (
    <button
      id="logoutButton"
      data-testid="logout-button"
      onClick={handleLogout}
    >
      <CiLogout />
    </button>
  );
}
