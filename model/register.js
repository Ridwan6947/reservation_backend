import mongoose from "mongoose";
import validator from "validator";
import  jwt  from "jsonwebtoken";
import bcrypt from 'bcrypt';


const registerSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
        minLength: [5 , "Full name must contain atleast 5 letters"],
    },
    email:{
        type:String,
        required:true,
        validate: [validator.isEmail , "Enter a valid email"],
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    refreshToken:{
        type:String,
    },
});

registerSchema.pre("save" , async function(next){
    if(!this.isModified("password")) return next(); // check if the password was modified inorder to prevent multiple use of bcrypt encryption
    this.password = bcrypt.hash(this.password , 3)
})

registerSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password);            
}

registerSchema.methods.generateAccessToken = function(){
     // Generating a JWT (JSON Web Token) with the user's _id, email, and username as payload
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE
        }
    )
}
registerSchema.methods.generateRefreshToken = function(){
     // Generating a JWT (JSON Web Token) with the user's _id as payload
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE
        }
    )
    
}
export const Register = mongoose.model("Register" , registerSchema);