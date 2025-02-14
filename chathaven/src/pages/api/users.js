import connectToDatabase from "../../lib/mongodb";
import User from "../../models/User";

export default async function handler(req, res){
    await connectToDatabase();

    if(req.method === "GET"){
        try{
            
            const users = await User.find({}, "firstname lastname email _id");
            res.status(200).json(users);
        } catch(error){
            res.status(500).json({ error: "Error fetching users" });
        }
    } else{
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}