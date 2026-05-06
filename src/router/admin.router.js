import { Router } from "express";
import { verifyUserJwt } from "../middleware/autho.middleware.js";
import { adminlogin, adminlogout, adminProfile, registerNewAdmin } from "../controller/admin.controller.js";
import { registerDoctor } from "../controller/doctor.controller.js";




const router = Router()


router.route('/registerNewAdmin').post(registerNewAdmin)
router.route('/adminlogin').post(adminlogin)
router.route('/adminProfile').post(verifyUserJwt, adminProfile)
router.route('/adminlogout').get(verifyUserJwt, adminlogout)
router.route('/registerNewDoctor').post(verifyUserJwt, registerDoctor)

export default router