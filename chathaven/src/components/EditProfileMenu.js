import { useState } from "react";
import "./styles/Dashboard.css";
import { RxCross2 } from "react-icons/rx";

export default function EditProfileMenu({user, isOpen, onClose}) {
  const[editMode, setEditMode] = useState(false);
  if(!isOpen) return null;

  return (
    <div id="editProfileOverlay" style={{ display: isOpen ? "flex" : "none" }}>
      <div id="editProfileMenu" >
        <RxCross2 id="closeButton" onClick={onClose} />
        <h3>Your Profile</h3>
        <form id="userInfo">
          <div className="infoBox">
            <div className="inputGroup">
              <label>First name</label> <input className="" type="text" placeholder={user.firstname} disabled={!editMode}></input>
            </div>
            <div className="inputGroup">
              <label>Last name</label> <input type="text" placeholder={user.lastname} disabled={!editMode}></input>
            </div>
          </div>

          <div className="infoBox">
            <div className="inputGroup">
              <label>Email</label><input type="text" placeholder={user.email} disabled={!editMode}></input>
            </div>
            <div className="inputGroup">
              <label>Password</label><input type="password" placeholder="********" disabled={!editMode}></input>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
