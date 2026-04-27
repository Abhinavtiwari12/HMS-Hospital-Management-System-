import express from "express"
import { ApiError } from "../utils/apiError"
import { ApiResponse } from "../utils/apiResponse"
import { asyncHandler } from "../utils/asyncHandler"
import { User } from "../models/user.model"



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


export { registerUser,
    loginUser,
    userProfile,
    userlogout
 }