import express from "express"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Appointment } from "../models/appointment.model.js";



const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


const registerUser = asyncHandler( async (req, res) => {

    const {fullname, username, email, password, ganeder, dateOfBirth, phoneNumber} = req.body

    if(
        [fullname, username, email, password, ganeder, dateOfBirth, phoneNumber].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are require.")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const owner = await User.create({
        fullname,
        email,
        password,
        username: username.toLowerCase(),
        ganeder, 
        dateOfBirth, 
        phoneNumber

    })

    const createdUser = User.findById(owner._id).select(" -password -refreshToken ")

    if (!createdUser) {
        throw new ApiError(500, "somthing went wrong")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser.data, createdUser.message)
    )

})


const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    if (!email) {
        throw new ApiError(401, "email is require.")
    }

    const user = await User.findOne({email})

    if (!user) {
        throw new ApiError(401, "email or password is wrong.")
    }

    const checkPassword = await user.isPasswordCorrect(password)

    if (!checkPassword) {
        throw new ApiError(400, "email or password is wrong.")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await user.findById(user._id).select("-password")

    const options = {
        httpOnly: true,
        secure: false
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken}, "user loggedIn successfull."))

})


const userProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  })
}


const userlogout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
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
    .json(new ApiResponse(200,{}, "user logout success."))

})


import { Appointment } from "../models/appointment.model.js";


const bookAppointment = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { doctorId, appointmentDate, reason } = req.body;
        
        if (!doctorId || !appointmentDate) {
          return res.status(400).json({
            message: "Doctor and appointment date are required"
          });
        }
    
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== "doctor") {
          return res.status(404).json({
            message: "Doctor not found"
          });
        }
    
        const existingAppointment = await Appointment.findOne({
          doctor: doctorId,
          appointmentDate
        });
    
        if (existingAppointment) {
          return res.status(400).json({
            message: "This time slot is already booked"
          });
        }
    
        const appointment = await Appointment.create({
          patient: patientId,
          doctor: doctorId,
          appointmentDate,
          reason
        });
    
        return res.status(201).json({
          message: "Appointment booked successfully",
          appointment
        });

    } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};


export { registerUser,
    loginUser,
    userProfile,
    userlogout,
    bookAppointment
 }