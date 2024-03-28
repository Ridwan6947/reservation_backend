import errorHandler from "../error/error.js";
import { Register } from '../model/register.js';
import bcrypt from "bcrypt";
import ApiResponse from "../response/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenRefreshToken = async (userId) => {
    try {
        const user = await Register.findById(userId); // Find user by email from the database
        if (!user) {
            throw new errorHandler("User not found", 404);
        }

        const accessToken = user.generateAccessToken(); // Generate access token
        const refreshToken = user.generateRefreshToken(); // Generate refresh token
        user.refreshToken = refreshToken; // Save the refresh token in the database

        // Assuming refreshToken is saved in the database associated with the user

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating access and refresh tokens:", error);
        throw new errorHandler("Internal error while generating Access and refresh token",500);
    }
};


export const registerUser = async (req, res, next) => {
    const { fullname, email, password, username } = req.body;
    try {
        // Check if all required fields are provided
        if (!fullname || !email || !password || !username) {
            throw new errorHandler("Please fill all the details", 400);
        }

        const userExist = await Register.findOne({
            $or: [{ email }, { username }]
        })

        if (userExist) {
            throw new errorHandler("user already exist", 404);
        }

        const hashedPassword = await bcrypt.hash(password, 3);
        // Create a new user document
        const newUser = await Register.create({
            fullname,
            email,
            password: hashedPassword,
            username
        });

        // Optionally, return the created user object in the response
        res.status(200).json({
            success: true,
            message: "User registered successfully",
            user: newUser
        });
    } catch (error) {
        // Handle validation errors and other unexpected errors
        if (error.name === "ValidationError") {
            const validationErrors = Object.values(error.errors).map(
                (err) => err.message
            );
            return next(new errorHandler(validationErrors.join(', '), 400));
        } else {
            console.error(error);
            return next(new errorHandler("Internal server error", 500));
        }
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        throw new errorHandler("Please fill all the details", 400);
    }

    const user = await Register.findOne({email});

    if(!user){
        throw new errorHandler("User not found", 404);
    }

    const isPasswordvalid = await user.isPasswordCorrect(password);

    if(!isPasswordvalid){
        throw new errorHandler("Incorrect password", 400);
    }

    const {accessToken , refreshToken} = await generateAccessTokenRefreshToken(user._id)

    const loggedInUser = await Register.findById(user._id).select("-password")

    const options = {
        httpOnly: false,     // cookies can only be modified when we use httponly and secure 
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200 , 
            {
                user:loggedInUser,accessToken,refreshToken
            } , 
            "Login Successful"
        )
    )
}; 

export const logoutUser = async (req , res) =>{
    //remove refresh token from database
    await Register.findByIdAndUpdate(          //find and update user REfreshToken and delete it
        req.user._id,
        {
            $unset:{    //set is used to update in mongoDB
                refreshToken:1,
            },
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly: false,     // cookies can only be modified when we use httponly and secure 
        secure: true,
    }

    return res.status(200).clearCookie("accessToken" , options).clearCookie("refreshToken" , options).json(
        new ApiResponse(
            200 ,{},"User logged out"
        )
    )
}

export const refreshAccessToken  = async (req , res) =>{
    const incominmgRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incominmgRefreshToken){
        new errorHandler("Refresh token not found" , 401)
    }

    const decodedRefreshToken = jwt.verify(incominmgRefreshToken , process.env.REFRESH_TOKEN_SECRET)

    const user = await Register.findById(decodedRefreshToken?._id);

    if(!user){
        throw new errorHandler("Invalid Refresh token" , 404)
    }

    if(incominmgRefreshToken !== Register?.refreshToken){
        new errorHandler("Invalid Refresh token or exipred" , 401)
    }

    const options = {
        httpOnly: false,     // cookies can only be modified when we use httponly and secure 
        secure: true,
    }

    const {accessToken , newRefreshToken} = await generateAccessTokenRefreshToken(user._id)

    return res.status(200).cookie("accessToken" , accessToken , options).cookie("refreshToken" , newRefreshToken , options).json(
        new ApiResponse(
            200 , 
            {
                accessToken,
                refreshToken : newRefreshToken
            } , 
            "Access token refreshed"
        )
    )



}