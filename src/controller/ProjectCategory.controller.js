import { ProjectCategory } from "../models/ProjectCategory.model.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.utilis.js";



const addProjectCategrory = asyncHandler(async (req, res) => {


    // console.log("req body into project category ", req.body)

    const project = await ProjectCategory.create({
        projectCategoryName: req.body.projectCategoryName.toLowerCase(),
        projectCategoryDescription: req.body.projectCategoryDescription
    })

    await res.status(200).json(
        new ApiResponse(201, "New Project Category add", project)
    )
    console.log(project)
})

const showProjectCategrory = asyncHandler(async (req, res) => {


    const data = await ProjectCategory.find();

    res.status(200).json(
        new ApiResponse(200, "Fetched Data From the Project Categoryies", data)
    )
})


const deleteProjectCategory = asyncHandler(async (req, res) => {


    console.log("data into the delete project category is : ", req.body)

    const deleteDn = await ProjectCategory.deleteOne({ _id: req.body.id })


    res.status(200).json(
        new ApiResponse(201, "Product Category is delete ", deleteDn)
    )
    console.log(deleteDn)
})

export { addProjectCategrory, showProjectCategrory, deleteProjectCategory }