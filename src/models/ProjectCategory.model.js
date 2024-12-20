import mongoose from "mongoose"


const projectCategorySchema = new mongoose.Schema({

    projectCategoryName: {
        type: String,
        required: [true, "project Category Name   Fields is Required"]
    },
    projectCategoryDescription: {
        type: String,
    },



})


export const  ProjectCategory = mongoose.model("ProjectCategory", projectCategorySchema)