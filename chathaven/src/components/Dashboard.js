import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import "./styles/Dashboard.css";
import LogoutButton from "@/src/components/LogoutButton";
import DirectMessagesButton from "@/src/components/DirectMessagesButton";
import CreateTeamMenu from "@/src/components/CreateTeamMenu";

export default function DashboardPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Store admin status

  useEffect(() => {
    // Fetch teams from API
    fetch("/api/teams", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((error) => console.error("Error fetching teams:", error));

    // Fetch user info to check admin status
    fetch("/api/auth/me", {
      method: "GET",
      credentials: "include", // Required to send cookies
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((userData) => {
        if (userData?.isGlobalAdmin) {
          setIsAdmin(true);
        }
      })
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  const [message, setMessage] = useState("");
  const handleSendMessage = () => {
    // Logic to send message
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

  return (
    <div id="dashboardContainer">
      <div id="sidebar" className={sidebarOpen ? "open" : "closed"}>
        <ul id="channelList">
          <li id="teamHeader">
            TEAMS
            <br />
            {isAdmin && ( // Only show if the user is an admin
              <div id="createTeam" onClick={() => setIsMenuOpen(true)}>
                <FaPlus /> Create Team
              </div>
            )}
          </li>
          {teams.map((team) => (
            <li key={team.id || team.teamName} className="teamName">
              {team.teamName}
            </li>
          ))}
        </ul>
        <div id="directMessagesArea">
          <DirectMessagesButton />
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
        {sidebarOpen ? <MdKeyboardDoubleArrowLeft /> : <MdKeyboardDoubleArrowRight />}
      </button>

      <div id="messagesArea" className={sidebarOpen ? "shifted" : "fullWidth"}>
        <div className="sentMessage">message 1 message 1 message 1 message 1</div>
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
        <CreateTeamMenu
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
