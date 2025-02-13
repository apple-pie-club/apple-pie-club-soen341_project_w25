import { useRouter } from "next/router";
import "./styles/Dashboard.css";

export default function DirectMessagesButton() {
  const router = useRouter();

  // Function to handle the button click and navigate to the DMs dashboard
  const handleRedirect = () => {
    router.push("/dms"); // Navigate to the "dms-dashboard" page
  };

  return (
    <button id="directMessagesButton" onClick={handleRedirect}>
      Go to Direct Messages
    </button>
  );
}
