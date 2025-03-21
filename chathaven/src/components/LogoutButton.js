import "./styles/Dashboard.css";
import { CiLogout } from "react-icons/ci";

export default function LogoutButton({ handleLogout }) {
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
