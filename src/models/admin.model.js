import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


const adminSchema = new Schema( {
    adminName: {
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

    userName: {
        type: String,
        required: true
    }

},{timestamps: true}
)


adminSchema.pre("save", async function () {
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10)
})

adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

adminSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        adminName: this.adminName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

adminSchema.methods.generateRefreshToken = function () {
    return jwt.sign( {
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {

        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}


export const Admin = new mongoose.model("Admin", adminSchema)