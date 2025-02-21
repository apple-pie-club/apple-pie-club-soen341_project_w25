import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa6";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import "./styles/DMs.css";
import LogoutButton from "./LogoutButton";
import ChannelButton from "./ChannelButton";
import CreateDMMenu from "./CreateDMMenu";
import DMsWindow from "./DMsWindow";

export default function DMsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleToggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState);
  };

  // Fetch existing DMs on component mount
  useEffect(() => {
    fetch("/api/dms", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Participants fetched:", data); // Debug
        setParticipants(data);
      })
      .catch((error) => console.error(" Error fetching DMs:", error));
  }, []);

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
          {participants.length > 0 ? (
            participants.map((user) => (
              <li
                key={user._id}
                className={`dmItem ${
                  selectedUser?._id === user._id ? "active" : ""
                }`}
                onClick={() => {
                  console.log("the selected user is ", user);
                  setSelectedUser(user);
                }}
              >
                {user.email}
              </li>
            ))
          ) : (
            <li className="noDms">No DMs yet</li>
          )}
        </ul>

        <div id="logoutButtonArea">
          <LogoutButton />
          <ChannelButton />
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

      <DMsWindow selectedUser={selectedUser} sidebarOpen={sidebarOpen}/>

       {/*<div id="DmMessagesArea" className={sidebarOpen ? "shifted" : "fullWidth"}>
        <div className="sentMessage">
          message 1 message 1 message 1 message 1message 1 message 1 message 1
          message 1message 1{" "}
        </div>
        <div className="receivedMessage">message 2</div>
      </div>
      <div id="DmMessageBar" className={sidebarOpen ? "shifted" : "fullWidth"}>
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
      </div> */}

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
