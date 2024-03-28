import mongoose from 'mongoose';
import validator from 'validator';

const reservationSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true,
        minLength: [3,"Must contains atleast 3 letters"],
        maxLength: [20, "Must contain less than 20 letters"],
    },

    email:{
        type: String,
        required: true,
        validate: [validator.isEmail , "Provide a valid email"],
    },

    phone:{
        type: String,
        required: true,
        minLength: [10,"Must contains 10 digits"],
        maxLength: [10, "Must contain 10 digits"],
    },

    time:{
        type:String,
        required: true,
    },
    
    date:{
        type:String,
        required:true,
    },
});

export const Reservation = mongoose.model("Reservation", reservationSchema);
