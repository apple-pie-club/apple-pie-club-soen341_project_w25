import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa6";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { FaUserCircle, FaUserPlus, FaModx } from "react-icons/fa";
import "./styles/Dashboard.css";
import LogoutButton from "./LogoutButton";
import DirectMessagesButton from "./DirectMessagesButton";
import CreateTeamMenu from "./CreateTeamMenu";
import CreateChannelMenu from "./CreateChannelMenu";
import CMsWindow from "./CMsWindow";
import AddUserToChannelMenu from "./AddUserToChannelMenu";
import EditProfileMenu from "./EditProfileMenu";
import SocketClient from "./SocketClient";
import { useSocket } from "./SocketContext";
import { useRouter } from "next/router";
export default function DashboardPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [channelSidebarOpen, setChannelSidebarOpen] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] =
    useState(false);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [channelToModify, setChannelToModify] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const [isSocketClientVisible, setSocketClientVisible] = useState(false);
  // Fetch user details (including role)
  useEffect(() => {
    fetch("/api/user", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("User Data for Admin:", data); // Debugging log
        if (data && typeof data.isGlobalAdmin !== "undefined") {
          //Use isGlobalAdmin
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
    console.log("Selected Team:", team);
  };

  const handleAddUserToChannel = async (channelId, userIdToAdd) => {
    try {
      console.log("Adding user:", userIdToAdd, "to channel:", channelId);
      const response = await fetch("/api/channels", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, userIdToAdd }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Error adding user to channel:", result.error);
        alert(`Error: ${result.error}`);
        return;
      }

      console.log("User added successfully:", result.message);
      alert("User added successfully!");

      setChannels((prevChannels) =>
        prevChannels.map((channel) =>
          channel._id === channelId
            ? { ...channel, members: [...channel.members, userIdToAdd] }
            : channel
        )
      );
    } catch (error) {
      console.error("Failed to add user to channel:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const getMessageAreaClass = () => {
    if (!sidebarOpen && !channelSidebarOpen) return "bothClosed";
    if (!sidebarOpen) return "leftClosed";
    if (!channelSidebarOpen) return "rightClosed";
    return "";
  };

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
          setUser((prevUser) => ({
            ...prevUser,
            isChannelAdmin: [...prevUser.isChannelAdmin, data._id],
          }));
        }
      })
      .catch((error) => console.error("Error creating channel:", error));
  };

  const handleChannelLeave = (channelId) => {
    if (!user.isGlobalAdmin)
      setChannels((prevChannels) =>
        prevChannels.filter((channel) => channel._id !== channelId)
      );
  };

  // Logic for tracking the user's presence and changing their status accordingly
  const { userId, updateStatus } = useSocket(); // Access the userId and updateStatus from context
  const [lastActiveTime, setLastActiveTime] = useState(Date.now()); // Track last activity time
  const userStatusUpdated = {};

  const handleUserPresence = (userId) => {
    const currentTime = Date.now();
    const userLastActiveTime = lastActiveTime[userId];

    // If the user hasn't been active for more than 30 seconds, set them to away
    if (userLastActiveTime && currentTime - userLastActiveTime > 30000) {
      // Check if the user's status is already set to away
      if (!userStatusUpdated[userId]) {
        // 30 seconds of inactivity
        updateStatus("away"); // Emit status update to server (status 'away')

        // POST last active time to the API when status changes to away
        postLastActiveTime(userId, currentTime); // POST to API

        // Set the flag to true to prevent updating last active time again
        userStatusUpdated[userId] = true;
      }
    } else {
      updateStatus("available"); // Emit status update to server (status 'available')
      // Reset the flag to allow updates when they become inactive again
      userStatusUpdated[userId] = false;
    }
  };
  // Function to POST the last active time to the API
  const postLastActiveTime = async (userId, lastActiveTime) => {
    try {
      const response = await fetch("/api/lastactivetime", {
        method: "POST",
        body: JSON.stringify({
          userId,
          lastActiveTime,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update last active time");
      }

      // if necessary for debugging
      const data = await response.json();
      console.log("API response:", data);

      // Optionally handle the response here, such as updating the state or showing a success message
    } catch (error) {
      console.error("Error updating last active time:", error);
    }
  };

  const resetUserActivity = (userId) => {
    const currentTime = Date.now();
    setLastActiveTime((prevState) => ({
      ...prevState,
      [userId]: currentTime, // Reset the last active time for the user
    }));

    // Call the function to update their presence status to available
    handleUserPresence(userId);
  };

  // Set up event listeners for mousemove and keypress to detect activity
  useEffect(() => {
    if (userId) {
      const handleMouseMove = () => resetUserActivity(userId);
      const handleKeyPress = () => resetUserActivity(userId);

      document.addEventListener("mousemove", handleMouseMove); // Track mouse movement
      document.addEventListener("keydown", handleKeyPress); // Track keyboard input

      // Cleanup event listeners when component unmounts
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [userId]); // Ensure the event listeners are set up when userId is available

  // Check for inactivity every 5 seconds and update status accordingly
  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) {
        handleUserPresence(userId); // Check and update status based on inactivity
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [lastActiveTime, userId]);

  const handleLogout = async () => {
    // Emit status change to "unavailable" before logging out
    if (userId) {
      console.log("Setting status to 'unavailable' for user:", userId);
      updateStatus("unavailable"); // Emit the status change to "unavailable"
    }
    // Call logout API
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    // Redirect to login page after logout
    router.push("/login");
  };

  return (
    <div id="dashboardContainer">
      {/* Sidebar with admin check for Create Team */}
      <div id="logoutButtonArea">

        <div
          id="profileButton"
          onClick={() => {
            setIsProfileMenuOpen(true);
          }}
        >
          <FaUserCircle title="Your profile" />
            
        </div>
        <div
          id="profileButton"
          onClick={() => {
            setSocketClientVisible(true);
          }}
        >
          <FaModx />
        </div>

        <DirectMessagesButton />
        <LogoutButton handleLogout={handleLogout} />
      </div>
      <div
        id="sidebar"
        className={sidebarOpen ? "open" : "closed"}
        key={user?._id}
      >
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
              <></>
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
      </div>

      <CMsWindow
        selectedChannel={selectedChannel}
        messageAreaClass={getMessageAreaClass()}
        onLeaveChannel={handleChannelLeave}
      />
      <AddUserToChannelMenu
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        selectedChannel={channelToModify}
        selectedTeam={selectedTeam}
        onAddUser={handleAddUserToChannel}
      />
      {isProfileMenuOpen && (
        <EditProfileMenu
          user={user}
          setUser={setUser}
          isOpen={isProfileMenuOpen}
          onClose={() => setIsProfileMenuOpen(false)}
        />
      )}
      {isSocketClientVisible && (
        <>
          {/* Overlay to dim the background */}
          <div
            id="socketClientPopupOverlay"
            onClick={() => setSocketClientVisible(false)}
          ></div>

          {/* Pop-up container for SocketClient */}
          <div id="socketClientPopup">
            <SocketClient />
            {/* Optional Close Button */}
            <div
              id="closeButton"
              onClick={() => setSocketClientVisible(false)} // Hide SocketClient when clicked
            >
              Close
            </div>
          </div>
        </>
      )}

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
        )}
      </button>

      <button
        id="toggleChannelSidebarButton"
        data-testid="toggle-channel-sidebar-button"
        onClick={handleToggleChannelSidebar}
        className={channelSidebarOpen ? "open" : "closed"}
      >
        {channelSidebarOpen ? (
          <MdKeyboardDoubleArrowRight />
        ) : (
          <MdKeyboardDoubleArrowLeft />
        )}
      </button>

      <div
        id="channelSidebar"
        className={channelSidebarOpen ? "open" : "closed"}
      >
        <ul id="channelList">
          <li id="channelHeader">
            {selectedTeam ? "Channels for:" : "Select a team to view channels"}
            <br />
            <span id="selectedTeamText">
              {selectedTeam ? selectedTeam.teamName : ""}
            </span>
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
                className={`channelName ${
                  selectedChannel?._id === channel._id ? "active" : ""
                }`}
                onClick={() => {
                  console.log("Selected Channel:", channel);
                  setSelectedChannel(channel);
                }}
              >
                {(user?.isGlobalAdmin ||
                  user?.isChannelAdmin?.includes(channel._id)) && (
                  <button
                    id="addUser"
                    onClick={() => {
                      setChannelToModify(channel);
                      setIsUserModalOpen(true);
                    }}
                  >
                    <FaUserPlus />
                  </button>
                )}
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
          onCreateTeam={(newTeam) =>
            setTeams((prevTeams) => [...prevTeams, newTeam])
          }
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
      {loadingUser && teams && (
        <div className="loadingScreen">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
}
