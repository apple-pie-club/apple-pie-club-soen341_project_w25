import { useState, useEffect } from "react";

const CreateTeamMenu = ({ isOpen, onClose, onCreateTeam }) =>{
    const[users, setUsers] = useState([]);
    const[selectedUsers, setSelectedUsers] = useState([]);
    const [teamName, setTeamName] = useState("");

    useEffect(() => {
        if(isOpen){
            fetch("api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((error) => console.error("Error fetching users:", error));
        }
    }, [isOpen]);

    const handleUserSelection = (userId) =>{
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = async () =>{
        if(!teamName || selectedUsers.length === 0){
            alert("Please enter a team name and select at least one user.");
            return;
        }

        try{
            const response = await fetch("/api/teams", {
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ teamName, members: selectedUsers }),
            });

            const result = await response.json();

            if(response.ok){
                alert("Team created successfully!");
                onCreateTeam(result.team);
                onClose();
            } else{
                alert(`Error: ${result.error}`);
            }
        } catch(error){
            console.error("Error crating team:", error);
            alert("An error occurred. Please try again.");
        }
    };

    if(!isOpen) return null;

    return (
        <div className="menuOverlay">
            <div className="menuContent">
                <h2>Create a Team</h2>
                <input 
                    type="text"
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                />
                <div className="userList">
                    {users.map((user)=>(
                        <div key={user._id}>
                            <input
                                type="checkbox"
                                checked={selectedUsers.includes(user._id)}
                                onChange={() => handleUserSelection(user._id)}
                            />
                            {user.firstname} {user.lastname} <span id="email">{user.email}</span>
                        </div>
                    ))}
                </div>
                <button onClick={handleSubmit}>Create Team</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default CreateTeamMenu;