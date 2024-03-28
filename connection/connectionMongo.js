import mongoose from "mongoose";


export const dbConnection = () =>{
    mongoose.connect(process.env.mongoDB_URL,{dbName: "Restaurant_MERN",})
    .then(() => {
        console.log("Connected to database successfully");
    })
    .catch((err) => {
        console.log(err)
    });
};

