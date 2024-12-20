import { Project } from "../models/Project.models.js";
import { ApiError } from "../utilis/ApiError.utilis.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { uploadCloudinary } from "../utilis/Cloudinary.utilis.js";
import { asyncHandler } from "../utilis/asyncHandler.utilis.js";



// ! controller for create new project
const createProjects = asyncHandler(async (req, res) => {

    console.log("whole data of the create project into backend api ", req.body)
    console.log("whole data of the create project into backend api ", req.file)



    const createProjectImageUrl = await uploadCloudinary(req?.file?.path)
    console.log("createProjectImageUrl : ", createProjectImageUrl)


    if (createProjectImageUrl === null) {
        throw new ApiError(400, "Project Image Url issue ")
    }


    const {
        projectName,
        projectDescription,
        projectDeployLink,
        projectGithubLink,
        projectTags
    } = req.body

    // console.log("data into the create project ", req.body)

    // // console.table({
    // //     "Project Name": projectName,
    // //     "Project Description": projectDescription,
    // //     "Project Deploy Link": projectDeployLink,
    // //     "Project Github Link": projectGithubLink,
    // //     "Project Tags": projectTags
    // // });

    //  * Check Project Name is already EXIST or not 
    const projectFind = await Project.findOne({ projectName })
    // console.log('check project name is already present or not " ', projectFind)

    if (projectFind != null) {
        throw new ApiError(400, "Project Name is Already present ")
    }

    const projectInsertion = await Project.create({
        projectName,
        projectDescription,
        projectDeployLink,
        projectGithubLink,
        projectTags,
        projectImage: createProjectImageUrl?.url
    })
    console.log('Result After Creation of the project  " ', projectInsertion)

    res.status(201).json(
        new ApiResponse(200, "New Project is Created ")
    )
})


// ! controller for fetch projects 
const fetchProjects = asyncHandler(async (req, res) => {

    const projectsFetch = await Project.find();
    res.status(200).json(
        new ApiResponse(200, "Fetched Project ", projectsFetch)
    )

})
// ! controller for fetch projects 
const deleteProjects = asyncHandler(async (req, res) => {


    console.log("deleteProjects  ", req.params)
    const { _id } = req.params;

    const deleteProjectsResponse = await Project.deleteOne({ _id })
    console.log(deleteProjectsResponse)

    if (deleteProjectsResponse === null) {
        throw new ApiError(400, "Error into the find the project delete id or id is not correct ")
    }

    res.json(new ApiResponse(200, "Project is delete Successfully"))

})


// ! function for the update project 

const updateProject = asyncHandler(async (req, res) => {


    // console.log("update project  _id", req.params)
    const { _id } = req.params;
    // console.log("_id ", _id)
    // console.log("udpate project data  ", req.body)
    const { projectName, projectDescription, projectDeployLink, projectGithubLink, projectTags, projectImage } = req.body
    try {
        const updateProjectResponse = await Project.updateOne(
            { _id },
            { $set: { projectName, projectDescription, projectDeployLink, projectGithubLink, projectTags, projectImage } });
        // console.log("updateProjectResponse ", updateProjectResponse)
        res.json(new ApiResponse(200, "Project is updated Successfully"))
    } catch (error) {
        console.error('Error updating project:', error);
    }




})

export { createProjects, fetchProjects, deleteProjects, updateProject }