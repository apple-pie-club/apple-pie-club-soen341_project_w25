import { useState, useEffect } from "react";
import "./styles/Dashboard.css";
import { RxCross2 } from "react-icons/rx";
import { FiEdit } from "react-icons/fi";

export default function EditProfileMenu({user, setUser, isOpen, onClose}) {
  const[editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    oldPassword:"",
    newPassword:"",
  });
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      oldPassword: "",
      newPassword: "",
    });
  }, [user]);

  const turnOnEditMode = () =>{
    setEditMode(true);
  };

  const turnOffEditMode = () =>{
    setEditMode(false);
  }

  const showErrorMessage = (message) => {
    setError(message);
    setShowError(true);
  
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      oldPassword: "",
      newPassword: "",
    });
    
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  const showSuccessMessage = ()=>{
    setShowSuccess(true);

    setTimeout(() =>{
      setShowSuccess(false);
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(formData.email)) {
      showErrorMessage("Invalid email format.");
      return;
    }

    try {
      const response = await fetch("/api/auth/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: user.email,
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showErrorMessage(data.message || "Failed to update profile.");
        return;
      }
      setUser((prevUser) => ({
        ...prevUser,
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
      }));

      setEditMode(false);
      showSuccessMessage();
    } catch (err) {
      console.log(err);
      showErrorMessage("An error occurred. Please try again.");
    }
  };

  if(!isOpen) return null;
  
  return (
    <div id="editProfileOverlay" style={{ display: isOpen ? "flex" : "none" }}>
      <div id="editProfileMenu" >
        <RxCross2 id="closeButton" onClick={onClose} />
        <h3>Your Profile <FiEdit id="editButton" onClick={turnOnEditMode}/></h3>
        <form id="userInfo" onSubmit={handleSubmit}>
          <div className="infoBox">
            <div className="inputGroup">
              <label>First name</label> <input name="firstname" type="text" value={formData.firstname} onChange={handleChange} disabled={!editMode}></input>
            </div>
            <div className="inputGroup">
              <label>Last name</label> <input name="lastname" type="text" value={formData.lastname} onChange={handleChange} disabled={!editMode}></input>
            </div>
          </div>

          {editMode?
          <div className="infoBox">
          <div className="inputGroup">
            <label>Email</label><input name="email" type="text" value={formData.email} onChange={handleChange} disabled={!editMode}></input>
            <label style={{marginTop:20 +'px'}}>Password</label><input name="oldPassword" type="password" placeholder="Enter old password" onChange={handleChange} disabled={!editMode} style={{marginBottom:10 +'px'}}></input>
            <input name="newPassword" type="password" placeholder="Enter new password" onChange={handleChange} disabled={!editMode}></input>
          </div>
        </div>
            :
          <div className="infoBox">
            <div className="inputGroup">
              <label>Email</label><input name="email" type="text" value={formData.email} disabled={!editMode}></input>
            </div>
            
            <div className="inputGroup">
              <label>Password</label><input name="password" type="password" placeholder="********" disabled={!editMode}></input>
            </div>
          </div>
          }

        {editMode && 
        (<div id="buttonGroup">
          <button className="button" type="submit">Save changes</button>
          <button className="button" onClick={turnOffEditMode}>Cancel</button>
        </div>)
        }
        </form>
        {showError && 
        <div className={`alert ${showError ? "show" : ""}`}>
          <p className="error">{error}</p>
        </div>}

        {showSuccess &&
        <div className={`success ${showSuccess ? "show" : ""}`}>
          <p className="successMessage">User information updated</p>
        </div>
        }
      </div>
    </div>
  );
}
