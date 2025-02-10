import connectToDatabase from "@/lib/mongodb";
import Team from "../../models/Team";

export default async function handler(req, res){
    await connectToDatabase();
    if(req.method ==="POST"){
        try{
            const { teamName, members } = req.body;

            if(!teamName || !members || members.length === 0){
                return res.status(400).json({error: "Team name and members are  required"});
            }

            const newTeam = new Team({ teamName, members });
            await newTeam.save();

            res.status(201).json({ message: "Team created successfully!", team: newTeam });
        } catch(error){
            res.status(500).json({ error: "Error creating team" });
        }
    }

    if(req.method === "GET"){
            try{
                const teams = await Team.find({}, "teamName");
                res.status(200).json(teams);
            } catch(error){
                res.status(500).json({ error: "Error fetching teams" });
            }
        }
    
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
        
}