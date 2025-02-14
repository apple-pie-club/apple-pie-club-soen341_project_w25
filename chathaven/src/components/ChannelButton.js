import { useRouter } from "next/router";
import "./styles/DMs.css";
import { PiKeyReturnFill } from "react-icons/pi";
export default function ChannelButton() {
  const router = useRouter();

  // Function to handle the button click and navigate to the DMs dashboard
  const handleRedirect = () => {
    router.push("/dashboard"); // Navigate to the "dms-dashboard" page
  };

  return (
    <button id="channelButton" onClick={handleRedirect}>
      <PiKeyReturnFill />
    </button>
  );
}
