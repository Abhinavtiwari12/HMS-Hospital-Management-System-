import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


const adminSchema = new Schema( {
    adminName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    email:{
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },


})

export const Admin = new mongoose.model("Admin", adminSchema)