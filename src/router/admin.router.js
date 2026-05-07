import { Router } from "express";
import { verifyAdminJwt } from "../middleware/autho.middleware.js";
import { adminlogin, adminlogout, adminProfile, registerNewAdmin } from "../controller/admin.controller.js";
import { registerDoctor } from "../controller/doctor.controller.js";




const router = Router()


router.route('/registerNewAdmin').post(registerNewAdmin)
router.route('/adminlogin').post(adminlogin)
router.route('/adminProfile').get(verifyAdminJwt, adminProfile)
router.route('/adminlogout').get(verifyAdminJwt, adminlogout)
router.route('/registerNewDoctor').post(verifyAdminJwt, registerDoctor)

export default router