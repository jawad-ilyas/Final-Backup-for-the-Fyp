import mongoose from "mongoose"

const workSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: [true, "Work Fields is Required"]
        },
        description: {
            type: String,
            required: [true, "Description Fields is Required"]
        },
        avatar: {
            type: String,
            required: [true, "avatar Fields is Required"]
        }

    }, { timestamps: true }
)


export const Work = mongoose.model("Work", workSchema)