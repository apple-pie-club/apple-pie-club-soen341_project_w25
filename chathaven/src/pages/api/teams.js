import connectToDatabase from "../../lib/mongodb";
import Team from "../../models/Team";
import User from "../../models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectToDatabase();
  if (req.method === "POST") {
    try {
      const token = req.cookies.authToken;
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Decode token to get the logged-in user's ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      let { teamName, members } = req.body;

      if (!teamName) {
        return res.status(400).json({ error: "Team name is required" });
      }

      // Ensure the creator is always included in the team
      if (!members) {
        members = [userId];
      } else if (!members.includes(userId)) {
        members.push(userId);
      }

      const newTeam = new Team({ teamName, members });
      await newTeam.save();

      res
        .status(201)
        .json({ message: "Team created successfully!", team: newTeam });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error creating team" });
    }
  }

    if(req.method === "GET"){
            try{
              
                const token = req.cookies.authToken;
                if(!token){
                    return res.status(401).json({ error: "Unauthorized" });
                }
                

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.userId;
                

                const user = await User.findById(userId);
                
                if (!user) {
                  
                  return res.status(404).json({ error: "User not found" });
                }
                
                console.log("Checking User in DB:", user);
                console.log("isGlobalAdmin:", user.isGlobalAdmin);

                let teams;
                if (user.isGlobalAdmin) {
                  // Global Admins see all teams
                  console.log("User is a Global Admin. Fetching ALL teams...");
                  teams = await Team.find({}).populate("members", "firstname lastname email _id");
                 } else {
                  console.log("User is NOT a Global Admin. Fetching only assigned teams...");
                  teams = await Team.find({ members: userId }).populate("members", "firstname lastname email _id");
                 }
                 console.log("Teams Fetched:", teams);
                res.status(200).json(teams);
            } catch(error){
                console.log(error);
                res.status(500).json({ error: "Error fetching teams" });
            }
        }
    
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
        
}
