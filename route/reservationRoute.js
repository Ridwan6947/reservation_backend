import express from 'express';
import { sendReservation } from '../controller/reservationController.js';

const router = express.Router();

router.post('/sendRequest' , sendReservation);

export default router;