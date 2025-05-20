const jwt =require("jsonwebtoken");
const Person=require("../Models/person");
require("dotenv").config();

const JWT_SECRET=process.env.JWT_SECRET;
module.exports=async (req,res,next)=>{
    const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}