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
import { FiInfo } from "react-icons/fi";
import CreateChannelMenu from "@/src/components/CreateChannelMenu";

export default function DashboardPage() {

    const [isMenuOpen, setIsMenuOpen]= useState(false);
    const[teams, setTeams] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [channelSidebarOpen, setChannelSidebarOpen] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [channels, setChannels] = useState([]);

    useEffect(() =>{
        fetch("/api/teams", {
          method: "GET",
          credentials: "include",
        })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
            setTeams(data);
        })
        .catch((error) => console.error("error fetching teams:", error));
    }, []);
    
    useEffect(() => {
      if (selectedTeam) {
        fetch(`/api/channels?teamId=${selectedTeam._id}`, {
          method: "GET",
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("fetched channels:", data);
            setChannels(data);
          })
          .catch((error) => console.error("Error fetching channels:", error));
      }
    }, [selectedTeam]);
    
    const handleCreateChannel = (newChannel) => {
      fetch("/api/channels", {
        method: "POST",
        body: JSON.stringify({name: newChannel.channelName,
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
          if(data.error){
            console.error("Error creating channel:", data.error);
          } else{
            setChannels((prevChannels) => [...prevChannels,data]);
          }
        })
        .catch((error) => console.error("Error creating channel:", error));
    };


  const [message, setMessage] = useState("");
  const handleSendMessage = () => {
    //logic to send message
    setMessage(""); // Clear input after sending
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState);
  };

    const handleToggleChannelSidebar = () =>{
      setChannelSidebarOpen(prevState => !prevState);
    }
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      };
    
    const getMessageAreaClass = () => {
      if (!sidebarOpen && !channelSidebarOpen) return 'bothClosed';
      if (!sidebarOpen) return 'leftClosed';
      if (!channelSidebarOpen) return 'rightClosed';
      return '';
    };
    
    const handleTeamSelect = (team) =>{
      setSelectedTeam(team);
      console.log(team.members);
    }

    useEffect(() => {
      console.log("Updated Team:", selectedTeam);
    }, [selectedTeam]);

return (
    <div id="dashboardContainer">
        <div id="sidebar" className={sidebarOpen ? "open" : "closed"}>
        <ul id="teamList">
            <li id="teamHeader">TEAMS <br/>
            <div id="createTeam" onClick={() => setIsMenuOpen(true)}><FaPlus /> Create Team</div></li>
            {teams.map((team)=>(
                <li key={team._id} className="teamName" onClick={() => handleTeamSelect(team)}>{team.teamName}</li>
            ))}
        </ul>
            <div id="logoutButtonArea">
              <LogoutButton />
              <DirectMessagesButton />
            </div>
        </div>

        <button id="toggleSidebarButton" onClick={handleToggleSidebar} className={sidebarOpen ? "open" : "closed"}>
          {sidebarOpen ? <MdKeyboardDoubleArrowLeft /> : <MdKeyboardDoubleArrowRight />}
        </button>

        <div id="messagesArea" className={getMessageAreaClass()}>
            <div className="sentMessage">message 1 message 1 message 1 message 1message 1 message 1 message 1 message 1message 1 </div>
            <div className="receivedMessage">message 2</div>
        </div>
        <div id="messageBar" className={getMessageAreaClass()}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleSendMessage}><FaArrowUp /></button>
        </div>
        <button id="toggleChannelSidebarButton" onClick={handleToggleChannelSidebar} className={channelSidebarOpen ? "open" : "closed"}>
          {channelSidebarOpen ? <MdKeyboardDoubleArrowRight /> : <MdKeyboardDoubleArrowLeft />} </button>
        <div id="channelSidebar" className={channelSidebarOpen ? "open" : "closed"}>
          <ul id="channelList">
              <li id="channelHeader">{selectedTeam ? "Channels for:" : "Select a team to view channels" }<br/>
              <span id="selectedTeamText">{selectedTeam ? selectedTeam.teamName : ""}</span><br/>
              <div id="createChannel" className={selectedTeam ? "" : "teamNotSelected"} onClick={() => setIsCreateChannelModalOpen(true)}><FaPlus /> Create Channel</div></li>
              {channels.map((channel) => (
                <li key={channel._id} className="channelName">{channel.name}</li>
              ))}
          </ul>
        </div>
        {isMenuOpen && <CreateTeamMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onCreateTeam={(newTeam) => setTeams((prevTeams) => [...prevTeams, newTeam])} />}
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
