import errorHandler from "../error/error.js";
import { Reservation } from "../model/reservation.js";

export const sendReservation = async(req , res , next) => {
    const {fullname , email , phone , time , date} = req.body;
    if(!fullname || !email || !phone || !time || !date){
        return next (new errorHandler("Please fill every detail" , 400))
    }
    try {
        await Reservation.create({fullname , email , phone , time , date});
        res.status(200).json({
            success: true,
            message: "Reservation made successfully",
        })
    } catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = Object.values(error.errors).map(
                (err) => err.message
            );
            return next(new errorHandler(validationErrors.join(', '), 400));
        } 
        return next(error);
    }
};
