import  express  from "express";
import { loginUser, logoutUser} from "../controller/registerController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { refreshAccessToken } from "../controller/registerController.js";

const router = express.Router();

router.route('/login').post(loginUser);

//secure Routes
router.route('/logout').post(verifyJWT ,logoutUser)
router.route('/refreshToken').post(refreshAccessToken)

export default router;


