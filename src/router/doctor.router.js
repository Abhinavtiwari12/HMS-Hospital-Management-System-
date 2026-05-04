import { Router } from "express";
import { verifyDoctorJwt } from "../middleware/autho.middleware";
import { doctorlogout, doctorProfile, getDoctorAppointments, loginDoctor } from "../controller/doctor.controller";




const router = Router()


router.route('/doctorlogin').post(loginDoctor)
router.route('/doctorlogout').post(verifyDoctorJwt, doctorlogout)
router.route('/doctorProfile').get(verifyDoctorJwt, doctorProfile)
router.route('/getDoctorAppointments').get(verifyDoctorJwt, getDoctorAppointments)


export default router