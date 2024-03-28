import errorHandler from "../error/error.js";
import jwt from "jsonwebtoken";
import { Register } from "../model/register.js";

export const verifyJWT = async ( req , _ , next)=>{
    try {
        //retrive token from cookies or from header 
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "")  // taking accessToken from either cookie or from header -> authorization -> bearer
        console.log(token);
        if(!token){
            throw new errorHandler("token not found" , 401)
        }
        // verify whether the token retrived from previous step is valid or not
        const tokenInformation = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
        
        //if token verified then retrive user from database
        const user = await Register.findById(tokenInformation?._id).select("-password -refreshToken")
    
        if(!user){
            throw new errorHandler("user not found" , 401)
        }
        req.user = user;
        next()
    } catch (error) {
        throw new errorHandler(error?.message || "invalid access token" , 500)
    }
}
