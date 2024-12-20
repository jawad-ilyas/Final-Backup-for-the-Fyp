import mongoose from "mongoose";

const workExperienceSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true,
        trim: true,
    },
    desc: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },

});

export const workExperience = mongoose.model('workExperience', workExperienceSchema);


