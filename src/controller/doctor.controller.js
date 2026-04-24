import express from "express"
import { ApiError } from "../utils/apiError"
import { ApiResponse } from "../utils/apiResponse"
import { asyncHandler } from "../utils/asyncHandler"
import { Doctor } from "../models/doctor.model"
import { contains } from "validator"



const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const doctor = await Doctor.findById(userId)
        const accessToken = doctor.generateAccessToken()
        const refreshToken = doctor.generateRefreshToken()

        user.refreshToken = refreshToken
        await doctor.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}




const registerDoctor = asyncHandler( async (req, res) => {

    const {doctorName, email, password, specialization, experience, fee, qualifications, hospitalName, availableDays, availableTimeSlots} = req.body

    if(
        [doctorName, email, password, specialization, experience, fee, qualifications, hospitalName, availableDays, availableTimeSlots].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are require.")
    }

    const existedDoctor = await Doctor.findOne({
        $or: [{ username }, { email }]
    })

    if (existedDoctor) {
        throw new ApiError(409, "Doctor with email or username already exists")
    }

    const doctor = await Doctor.create({
        doctorName,
        email,
        password,
        specialization, 
        experience, 
        fee, 
        qualifications, 
        hospitalName, 
        availableDays, 
        availableTimeSlots

    })

    const createdDoctor = Doctor.findById(doctor._id).select(" -password -refreshToken ")

    if (!createdDoctor) {
        throw new ApiError(500, "somthing went wrong")
    }

    return res.status(201).json(
        new ApiResponse(200, createdDoctor.data, createdDoctor.message)
    )

})

const loginDoctor = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    if (!email) {
        throw new ApiError(401, "email is require.")
    }

    const doctor = await Doctor.findOne({email})

    if (!doctor) {
        throw new ApiError(401, "email or password is wrong.")
    }

    const checkPassword = await doctor.isPasswordCorrect(password)

    if (!checkPassword) {
        throw new ApiError(400, "email or password is wrong.")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(doctor._id)

    const loggedInDoctor = await Doctor.findById(doctor._id).select("-password")

    const options = {
        httpOnly: true,
        secure: false
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { doctor: loggedInDoctor, accessToken, refreshToken}, "doctor loggedIn successfull."))

})


const doctorProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    doctor: req.doctor,
  })
}



const doctorlogout = asyncHandler(async (req, res) => {
    await Doctor.findByIdAndUpdate(
        req.doctor._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{}, "doctor logout success."))

})




export { 
    registerDoctor, 
    loginDoctor,
    doctorProfile,
    doctorlogout
}