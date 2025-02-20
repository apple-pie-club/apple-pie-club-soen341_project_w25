import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa6";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import "./styles/Dashboard.css";
import LogoutButton from "./LogoutButton";
import DirectMessagesButton from "./DirectMessagesButton";
import CreateTeamMenu from "./CreateTeamMenu";
import CreateChannelMenu from "./CreateChannelMenu";
import CMsWindow from "./CMsWindow";

export default function DashboardPage() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [channelSidebarOpen, setChannelSidebarOpen] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch user details (including role)
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


  useEffect(() => {
    if (!loadingUser) {
    fetch("/api/teams", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Teams Fetched:", data);
        setTeams(data);
      })
      .catch((error) => console.error("Error fetching teams:", error));
    }
  }, [loadingUser]);

  useEffect(() => {
    if (selectedTeam && !loadingUser) {
      fetch(`/api/channels?teamId=${selectedTeam._id}`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched channels:", data);
          setChannels(data);
        })
        .catch((error) => console.error("Error fetching channels:", error));
    }
  }, [selectedTeam, loadingUser]);

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    console.log("ℹ️ Selected Team:", team);
  };

  const getMessageAreaClass = () => {
    if(!sidebarOpen && !channelSidebarOpen) return 'bothClosed';
    if(!sidebarOpen) return 'leftClosed';
    if(!channelSidebarOpen) return 'rightClosed';
    return '';
  }

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleToggleChannelSidebar = () => {
    setChannelSidebarOpen((prev) => !prev);
  };
  const handleCreateChannel = (newChannel) => {
    fetch("/api/channels", {
      method: "POST",
      body: JSON.stringify({
        name: newChannel.channelName,
        teamId: newChannel.teamId,
        members: newChannel.members,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Error creating channel:", data.error);
        } else {
          setChannels((prevChannels) => [...prevChannels, data]);
        }
      })
      .catch((error) => console.error("Error creating channel:", error));
  };

  return (
    <div id="dashboardContainer">
      {/* Sidebar with admin check for Create Team */}
      <div id="sidebar" className={sidebarOpen ? "open" : "closed"} key={user?._id}>
        <ul id="teamList">
          <li id="teamHeader">
            TEAMS <br />
            {loadingUser ? (
              <p>Loading...</p>
            ) : user?.isGlobalAdmin ? ( // Check isGlobalAdmin instead of role
              <div id="createTeam" onClick={() => setIsMenuOpen(true)}>
                <FaPlus /> Create Team
              </div>
            ) : (
              <p>Not an admin</p>
            )}
          </li>


          {teams.length > 0 ? (
            teams.map((team) => (
              <li
                key={team._id}
                className="teamName"
                onClick={() => handleTeamSelect(team)}
              >
                {team.teamName}
              </li>
            ))
          ) : (
            <li className="noTeams">No teams yet</li>
          )}
        </ul>
        <div id="logoutButtonArea">
          <LogoutButton />
          <DirectMessagesButton />
        </div>
      </div>
        
      <CMsWindow selectedChannel={selectedChannel} messageAreaClass={getMessageAreaClass()}/>


      <button
        id="toggleSidebarButton"
        onClick={handleToggleSidebar}
        className={sidebarOpen ? "open" : "closed"}
      >
        {sidebarOpen ? <MdKeyboardDoubleArrowLeft /> : <MdKeyboardDoubleArrowRight />}
      </button>

      <button
        id="toggleChannelSidebarButton"
        onClick={handleToggleChannelSidebar}
        className={channelSidebarOpen ? "open" : "closed"}
      >
        {channelSidebarOpen ? <MdKeyboardDoubleArrowRight /> : <MdKeyboardDoubleArrowLeft />}
      </button>

      <div id="channelSidebar" className={channelSidebarOpen ? "open" : "closed"}>
        <ul id="channelList">
          <li id="channelHeader">
            {selectedTeam ? "Channels for:" : "Select a team to view channels"}
            <br />
            <span id="selectedTeamText">{selectedTeam ? selectedTeam.teamName : ""}</span>
            <br />
            <div
              id="createChannel"
              className={selectedTeam ? "" : "teamNotSelected"}
              onClick={() => setIsCreateChannelModalOpen(true)}
            >
              <FaPlus /> Create Channel
            </div>
          </li>
          {channels.length > 0 ? (
            channels.map((channel) => (
              <li
                key={channel._id}
                className={`channelName ${selectedChannel?._id === channel._id ? "active" : ""}`}
                onClick={() => {
                  console.log("ℹ️ Selected Channel:", channel);
                  setSelectedChannel(channel);
                }}
              >
                {channel.name}
              </li>
            ))
          ) : (
            <li className="noChannels"> No channels yet</li>
          )}
        </ul>
      </div>

      {isMenuOpen && (
        <CreateTeamMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onCreateTeam={(newTeam) => setTeams((prevTeams) => [...prevTeams, newTeam])}
        />
      )}
      {isCreateChannelModalOpen && (
        <CreateChannelMenu
          isOpen={isCreateChannelModalOpen}
          onClose={() => setIsCreateChannelModalOpen(false)}
          teamMembers={selectedTeam ? selectedTeam?.members : []}
          onCreateChannel={handleCreateChannel}
          teamId={selectedTeam ? selectedTeam._id : ""}
        />
      )}
    </div>
  );
}
