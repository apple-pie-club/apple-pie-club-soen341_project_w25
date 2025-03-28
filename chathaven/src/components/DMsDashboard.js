import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa6";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import "./styles/DMs.css";
import LogoutButton from "./LogoutButton";
import ChannelButton from "./ChannelButton";
import CreateDMMenu from "./CreateDMMenu";
import DMsWindow from "./DMsWindow";
import EditProfileMenu from  "./EditProfileMenu";

export default function DMsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState);
  };

  useEffect(() => {
    fetch("/api/user", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("User Data for Admin:", data); // Debugging log
        if (data && typeof data.isGlobalAdmin !== "undefined") { //Use isGlobalAdmin
          setUser(data);
        } else {
          console.warn("isGlobalAdmin field not found in user data!");
        }
      })
      .catch((error) => console.error("Error fetching user data:", error))
      .finally(() => setLoadingUser(false));
  }, []);

  // Fetch existing DMs on component mount
  useEffect(() => {
    if(!loadingUser)
    {fetch("/api/dms", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Participants fetched:", data); // Debug
        setParticipants(data);
      })
      .catch((error) => console.error(" Error fetching DMs:", error));}
  }, [loadingUser]);

  return (
    <div id="DMsContainer">
      <div id="logoutButtonArea">
      <div id="profileButton" onClick={()=> {
                      setIsProfileMenuOpen(true)
                      }} title = "Your profile">
                      <FaUserCircle />
            </div>
            <ChannelButton />
          <LogoutButton />
        </div>
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
      </div>
      <button
        id="toggleSidebarButton"
        data-testid="toggle-sidebar-button"
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

      {isMenuOpen && (
        <CreateDMMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onCreateTeam={(newTeam) =>
            setTeams((prevTeams) => [...prevTeams, newTeam])
          }
        />
      )}

      {isProfileMenuOpen && (<EditProfileMenu 
            user = {user}
            setUser = {setUser} 
            isOpen = {isProfileMenuOpen}
            onClose={()=>setIsProfileMenuOpen(false)}
            />
      )}
      { (loadingUser && participants) && (
        <div className="loadingScreen">
          <div className="loader"></div>
        </div>
      )} 
    </div>
  );
}
