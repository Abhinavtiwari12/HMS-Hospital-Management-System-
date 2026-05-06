import { Router } from "express";
import { bookAppointment, cancelAppointment, loginUser, registerUser, userlogout, userProfile } from "../controller/user.controller.js";
import { verifyUserJwt } from "../middleware/autho.middleware.js";




const router = Router()


router.route('/registerUser').post(registerUser)
router.route('/userlogin').post(loginUser)
router.route('/userlogout').post(verifyUserJwt, userlogout)
router.route('/userProfile').get(verifyUserJwt, userProfile)
router.route('/bookAppointment').post(verifyUserJwt, bookAppointment)
router.route("/appointments/:id/cancel").post(verifyUserJwt, cancelAppointment);


export default router