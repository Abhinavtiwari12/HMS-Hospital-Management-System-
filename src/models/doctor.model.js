import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const doctorSchema = new Schema({
    doctorName: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "User",
        type: String,
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

    specialization: {
        type: String,
        required: true
    },

    experience: {
        type: Number, // in years
        required: true
    },

    fees: {
        type: Number,
        required: true
    },

    qualifications: [String],

    hospitalName: {
        type: String
    },

    availableDays: {
        type: [String], // ["Mon", "Tue"]
        default: []
    },

    availableTimeSlots: [
        {
            startTime: String,
            endTime: String
        }
    ],

    rating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    }

}, { timestamps: true });


doctorSchema.pre("save", async function () {
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10)
})

doctorSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

doctorSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

doctorSchema.methods.generateRefreshToken = function () {
    return jwt.sign( {
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {

        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const  Doctor = new mongoose.model("Doctor", doctorSchema)