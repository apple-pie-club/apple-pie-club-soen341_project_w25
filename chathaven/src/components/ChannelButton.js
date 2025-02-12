import { useRouter } from "next/router";
import "./styles/DMs.css";

export default function ChannelButton() {
  const router = useRouter();

  // Function to handle the button click and navigate to the DMs dashboard
  const handleRedirect = () => {
    router.push("/dashboard"); // Navigate to the "dms-dashboard" page
  };

  return (
    <button id="channelButton" onClick={handleRedirect}>
      Go to Channels
    </button>
  );
}
