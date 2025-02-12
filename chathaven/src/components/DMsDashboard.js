import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import "./styles/DMs.css";
import LogoutButton from "@/src/components/LogoutButton";
import ChannelButton from "@/src/components/ChannelButton";
import CreateDMMenu from "@/src/components/CreateDMMenu";

export default function DMsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [dms, setDms] = useState([]);
  const [userId, setUserId] = useState(null);

  const handleSendMessage = () => {
    //logic to send message
    setMessage(""); // Clear input after sending
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Fetch existing DMs on component mount
  useEffect(() => {
    const fetchDms = async () => {
      const storedToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      if (!storedToken) {
        console.error("No auth token found");
        return;
      }

      try {
        const response = await fetch("/api/dms", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch DMs");
        }

        const data = await response.json();
        setDms(data); // Save DMs

        // Get the logged-in user's ID from the token
        const decodedToken = JSON.parse(atob(storedToken.split(".")[1]));
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error("Error fetching DMs:", error);
      }
    };

    fetchDms();
  }, []);

  // Function to get the other participant's email
  const getOtherUserEmail = (dm) => {
    if (!userId) return "Unknown User";
    const otherUser = dm.participants.find(
      (participant) => participant._id !== userId
    );
    return otherUser ? otherUser.email : "Unknown User";
  };

  return (
    <div id="DMsContainer">
      <div id="sidebar" className={sidebarOpen ? "open" : "closed"}>
        <ul id="DMsList">
          <li id="DMsHeader">
            Direct Messages
            <br />
            <div id="createDM" onClick={() => setIsMenuOpen(true)}>
              <FaPlus /> Create DM
            </div>
          </li>
          {dms.length > 0 ? (
            dms.map((dm) => (
              <li key={dm._id} className="dmItem">
                {getOtherUserEmail(dm)}
              </li>
            ))
          ) : (
            /*if there are no direct messages, nothing is displayed*/
            <li></li>
          )}
        </ul>

        <div id="channelArea">
          <ChannelButton />
        </div>
        <div id="logoutButtonArea">
          <LogoutButton />
        </div>
      </div>
      <button
        id="toggleSidebarButton"
        onClick={handleToggleSidebar}
        className={sidebarOpen ? "open" : "closed"}
      >
        {sidebarOpen ? (
          <MdKeyboardDoubleArrowLeft />
        ) : (
          <MdKeyboardDoubleArrowRight />
        )}{" "}
      </button>

      <div id="messagesArea" className={sidebarOpen ? "shifted" : "fullWidth"}>
        <div className="sentMessage">
          message 1 message 1 message 1 message 1message 1 message 1 message 1
          message 1message 1{" "}
        </div>
        <div className="receivedMessage">message 2</div>
      </div>
      <div id="messageBar" className={sidebarOpen ? "shifted" : "fullWidth"}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSendMessage}>
          <FaArrowUp />
        </button>
      </div>
      {isMenuOpen && (
        <CreateDMMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onCreateTeam={(newTeam) =>
            setTeams((prevTeams) => [...prevTeams, newTeam])
          }
        />
      )}
    </div>
  );
}
