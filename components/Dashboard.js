import { useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import "./styles/Dashboard.css"
import LogoutButton from "@/components/LogoutButton"

export default function DashboardPage() {
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

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      };

      
return (
    <div id="dashboardContainer">
        <div id="sidebar">
        <ul id="channelList">
            <li id="channelHeader">CHANNELS<br/>
            <div id="addChannel"><FaPlus /> Add Channel</div>
            </li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
            <li class="channelName">Channel</li>
        </ul>
        <div id="logoutButtonArea"><LogoutButton /></div>
        </div>

        <div id="messagesArea">
            <div class="sentMessage">message 1 message 1 message 1 message 1message 1 message 1 message 1 message 1message 1 </div>
            <div class="receivedMessage">message 2</div>
        </div>
        <div id="messageBar">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleSendMessage}><FaArrowUp /></button>
            </div>
    </div>
  );
}
