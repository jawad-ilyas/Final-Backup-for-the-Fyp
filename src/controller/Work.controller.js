import { upload } from "../middlerware/multer.middleware.js";
import { Work } from "../models/Work.models.js";
import { ApiError } from "../utilis/ApiError.utilis.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { deleteCloudinary, uploadCloudinary } from "../utilis/Cloudinary.utilis.js";
import { asyncHandler } from "../utilis/asyncHandler.utilis.js";

// !! controller for the addWork
const AddWork = asyncHandler(async (req, res) => {




    const name = req.body.name;
    const description = req.body.description;

    // Process the data (e.g., save to database)
    // console.log(name, description, avatorLocalPath?.path); // Log the data for now

    if (!name) {
        throw new ApiError(400, "Name is Required ")
    }
    if (!description) {
        throw new ApiError(400, "Description is Required ")

    }
    // check workName is already present or not 
    const workDb = await Work.findOne({ name })
    // console.log("workDb : ", workDb)

    //  validate the data 
    if (!workDb == null) {
        throw new ApiError(400, "Work is already present ")
    }


    // valiate the image 
    const avatorLocalPath = req.file?.path; // Contains information about the uploaded file

    if (!avatorLocalPath) {
        throw new ApiError(400, "Avator is not Updated Succesfully")
    }


    const avatar = await uploadCloudinary(avatorLocalPath);

    // console.log("url of the upload file into cloudinary", avatar)
    // add into database 

    const workCreate = await Work.create(
        {
            name,
            description,
            avatar: avatar?.url
        }
    )
    console.log("document is created ", workCreate)
    // return a response

    res.status(201).json(new ApiResponse(200, "New Work is created"))
})

// !! controller For the ShowWork

const ShowWork = asyncHandler(async (_, res) => {

    const showWorkData = await Work.find();
    // console.log("showWorkData : ",showWorkData)
    res.status(200).json(new ApiResponse(200, "Data", showWorkData))
})
// !! controller For the Delete Work
const DeleteWork = asyncHandler(async (req, res) => {

    console.log(req.body)
    
    const deleteDataWork = await Work.findById(req.body)
    
    console.log("deleteDataWork into work controller ", deleteDataWork);
    console.log("deleteDataWork into work controller avatar link  ", deleteDataWork.avatar);
    let avatar = deleteDataWork.avatar;
    // const filenameWithExtension = avatar.split('/').pop();
    // // console.log("filenameWithExtension ", filenameWithExtension)
    // // Step 2: Remove the extension
    // const filename = filenameWithExtension.split('.').slice(0, -1).join('.');
    // // console.log("filenameWithExtension.split('.') ", filenameWithExtension.split('.'))
    // // console.log("filenameWithExtension.split('.').slice(0, -1) ", filenameWithExtension.split('.').slice(0, -1))

    console.log(filename);
    const deleteImageresponse = await deleteCloudinary(avatar)
    console.log("deleteImageresponse ", deleteImageresponse.result)
    if (deleteImageresponse.result === 'ok'){
        if (deleteDataWork == null) {
            throw new ApiError(400, "Work is not found")
        }

        const deleteDataWorkResponse = await Work.deleteOne(req.body)
        // console.log(deleteDataWorkResponse)
        const showWorkData = await Work.find();

        if (deleteDataWorkResponse.acknowledged == true) {
            res.status(200).json(new ApiResponse(204, "Work is Delete Successfully", showWorkData))
        }
    }
    else{
        console.log("image is not delete able ")
    }
 


})


//  !! Controller for the update work

const UpdateWork = asyncHandler(async (req, res) => {

    console.log("Update work body : ", req.body)

    const { _id, name, description } = req.body


    console.log("_id", _id)
    console.log("name", name)
    console.log("description", description)

    const updateDataVerify = await Work.findById(_id);

    if (updateDataVerify === null) {
        throw new ApiError(400, "Work is not find")
    }

    console.log("updateDataVerify : ", updateDataVerify)
    const avatorLocalPath = req.file?.path

    if (avatorLocalPath === null) {
        const updateWorkResult = await Work.findOneAndUpdate({ _id }, {
            name,
            description
        }, {
            new: true
        })
        console.log("updateWorkResult : ", updateWorkResult)

    }
    else {
        // console.log("avatorLocalPath", avatorLocalPath)

        const avatar = await uploadCloudinary(avatorLocalPath)
        const updateWorkResult = await Work.findOneAndUpdate({ _id }, {
            name,
            description,
            avatar: avatar?.url
        }, {
            new: true
        })
        res.status(200).json(
            new ApiResponse(200, "Work is update successfully")
        )
        console.log("updateWorkResult : ", updateWorkResult)
    }



})

export { AddWork, ShowWork, DeleteWork, UpdateWork }