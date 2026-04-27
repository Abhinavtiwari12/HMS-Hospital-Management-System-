import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { findCandidates, registerCandidates } from "../service/admin.service.js"
import { Admin } from "../models/admin.model.js"
import { Candidate } from "../models/candidate.model.js"




const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const admin = await Admin.findById(userId)
        const accessToken = admin.generateAccessToken()
        const refreshToken = admin.generateRefreshToken()

        admin.refreshToken = refreshToken
        await admin.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerNewAdmin = asyncHandler( async (req, res) => {

    const {fullname, password, email, username} = req.body

    if(
        [fullname, password, username, email].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are require.")
    }

    const existedUser = await Admin.findOne({
       $or: [{ username }, { email }]
    })
   
    if (existedUser) {
       throw new ApiError(409, "admin with email or username already exists")
    }

    const admin = await Admin.create({
       fullname,
       email,
       password,
       username: username.toLowerCase(),
    })

    const createdAdmin = Admin.findById(owner._id).select(" -password -refreshToken ")

    if (!createdAdmin) {
        throw new ApiError(500, "somthing went wrong")
    }

    return res.status(201).json(
        new ApiResponse(201, createdAdmin.data, createdAdmin.message)
    )

})


const adminlogin = asyncHandler(async (req, res) => {

    const {email, password} = req.body

    if (!email) {
        throw new ApiError(401, "addharNumber is require.")
    }

    const admin = await Admin.findOne({ email })

    if (!admin) {
        throw new ApiError(400, "addharNumber or password is wrong.")
    }

    const checkPassword = await admin.isPasswordCorrect(password)

    if (!checkPassword) {
        throw new ApiError(400, "email or password is wrong.")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(admin._id)

    const loggedInAdmin = await Admin.findById(admin._id).select("-password")

    const options = {
        httpOnly: true,
        secure: false
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { admin: loggedInAdmin, accessToken, refreshToken}, "user loggedIn successfull."))
})


const adminProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: req.admin,
  })
}


const adminlogout = asyncHandler(async (req, res) => {
    await Admin.findByIdAndUpdate(
        req.admin._id,
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
    .json(new ApiResponse(200,{}, "Admin logout success."))

})




export { 
    registerNewAdmin, 
    adminlogin, 
    adminProfile, 
    adminlogout 
}