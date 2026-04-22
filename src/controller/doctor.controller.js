import express from "express"
import { ApiError } from "../utills/apiError"
import { ApiResponse } from "../utills/apiResponse"
import { asyncHandler } from "../utills/asyncHandler"
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

// const loginDoctor = asyncHandler(async (req, res) => {
//     const {email, password} = req.body

//     if()
// })




export { registerDoctor }