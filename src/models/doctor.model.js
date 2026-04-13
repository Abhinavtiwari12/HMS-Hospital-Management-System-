import mongoose, {Schema} from "mongoose";


const doctorSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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