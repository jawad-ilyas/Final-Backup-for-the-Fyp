import mongoose from "mongoose"

const skillSchema = new mongoose.Schema(
    {

        skillName: {
            type: String,
            required: [true, "skillName Fields is Required"]
        },
  
        icon: {
            type: String,
            required: [true, "icon Fields is Required"]
        }

    }, { timestamps: true }
)


export const Skill = mongoose.model("Skill", skillSchema)