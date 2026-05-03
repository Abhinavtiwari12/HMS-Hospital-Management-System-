import { Router } from "express";
import { bookAppointment, loginUser, registerUser, userlogout, userProfile } from "../controller/user.controller";
import { verifyUserJwt } from "../middleware/autho.middleware";




const router = Router()


router.route('/registerUser').post(registerUser)
router.route('/userlogin').post(loginUser)
router.route('/userlogout').post(verifyUserJwt, userlogout)
router.route('/userProfile').get(verifyUserJwt, userProfile)
router.route('/bookAppointment').post(verifyUserJwt, bookAppointment)


export default router