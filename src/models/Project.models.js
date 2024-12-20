import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
    },
    projectDescription: {
        type: String,
        required: [true, "Project Description is a required field"],
    },
    projectDeployLink: {
        type: String,
        required: [true, "Project Deploy Link is a required field"],
    },
    projectGithubLink: {
        type: String,
        required: [true, "Project Github Link is a required field"],
    },
    projectTags: {
        type: [String],
    },
    projectImage: {
        type: String,
        required: true,
    },
});

export const Project = mongoose.model("Project", projectSchema);
