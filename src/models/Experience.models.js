import mongoose from "mongoose";

const ExperienceSchema = new mongoose.Schema({
    year: {
        type: String,
        required: true,
        trim: true,
    },
    works: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'workExperience',
        required: true,
    }],
   

});

export const Experience = mongoose.model('Experience', ExperienceSchema);


