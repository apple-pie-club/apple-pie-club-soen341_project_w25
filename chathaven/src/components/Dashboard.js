import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import "./styles/Dashboard.css";
import LogoutButton from "@/src/components/LogoutButton";
import CreateTeamMenu from "@/src/components/CreateTeamMenu";

export default function DashboardPage() {
    const [isMenuOpen, setIsMenuOpen]= useState(false);
    const[teams, setTeams] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    useEffect(() =>{
        fetch("/api/teams", {
          method: "GET",
          credentials: "include",
        })
        .then((res) => res.json())
        .then((data) => {
            setTeams(data);
        })
        .catch((error) => console.error("error fetching teams:", error));
    }, []);
    // need to call an api endpoint to get the channels
    // get json file with list of channels
    // use .map() to list the channels on the sidebar
    
    // need to call an api endpoint to get the messages to display


    // need logic to add channel

    const [message, setMessage] = useState("");
    const handleSendMessage = () => {
        //logic to send message
        setMessage(""); // Clear input after sending
    };

    const handleToggleSidebar = () =>{
      setSidebarOpen(prevState => !prevState);
    }

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
            <li id="teamHeader">TEAMS<br/>
            <div id="createTeam" onClick={() => setIsMenuOpen(true)}><FaPlus /> Create Team</div></li>
            {teams.map((team)=>(
                <li className="teamName">{team.teamName}</li>
            ))}
        </ul>
        <div id="logoutButtonArea"><LogoutButton /></div>
        </div>
        <button id="toggleSidebarButton" onClick={handleToggleSidebar} className={sidebarOpen ? "open" : "closed"}>
          {sidebarOpen ? <MdKeyboardDoubleArrowLeft /> : <MdKeyboardDoubleArrowRight />} </button>

        <div id="messagesArea" className={sidebarOpen ? "shifted" : "fullWidth"}>
            <div className="sentMessage">message 1 message 1 message 1 message 1message 1 message 1 message 1 message 1message 1 </div>
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
                <button onClick={handleSendMessage}><FaArrowUp /></button>
        </div>
        {isMenuOpen && <CreateTeamMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onCreateTeam={(newTeam) => setTeams((prevTeams) => [...prevTeams, newTeam])} />} 
    </div>
  );
}
