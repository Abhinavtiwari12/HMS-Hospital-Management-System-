import express from "express"
import { ApiError } from "../utills/apiError"
import { ApiResponse } from "../utills/apiResponse"
import { asyncHandler } from "../utills/asyncHandler"
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

    const {fullname, username, email, password} = req.body

    if(
        [fullname, username, email, password].some((field) => field?.trim() === "")
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
        username: username.toLowerCase()

    })

    const createdUser = User.findById(owner._id).select(" -password -refreshToken ")

    if (!createdUser) {
        throw new ApiError(500, "somthing went wrong")
    }

    return res.status(201).json(
        new ApiResponse(200, createdOwner.data, createdOwner.message)
    )

})

export { registerUser }