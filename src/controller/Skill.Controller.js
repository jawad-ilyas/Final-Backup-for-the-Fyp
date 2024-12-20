import { Skill } from "../models/Skill.models.js";
import { ApiError } from "../utilis/ApiError.utilis.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { uploadCloudinary } from "../utilis/Cloudinary.utilis.js";
import { asyncHandler } from "../utilis/asyncHandler.utilis.js";

// !! skill for the addWork
const createSkill = asyncHandler(async (req, res) => {




    const skillName = req.body.skillName;

    console.log(skillName)
    console.log(req.body)
    // Process the data (e.g., save to database)
    // console.log(name, description, avatorLocalPath?.path); // Log the data for now

    if (!skillName) {
        throw new ApiError(400, "skillName is Required ")
    }

    // check workName is already present or not 
    const SkillDb = await Skill.findOne({ skillName })
    // console.log("SkillDb : ", SkillDb)

    //  validate the data 
    if (!SkillDb == null) {
        throw new ApiError(400, "skillName is already present ")
    }


    // valiate the image 
    const iconLocalPath = await req.file?.path; // Contains information about the uploaded file
    // console.log(" iconLocalPath : ", iconLocalPath)
    if (!iconLocalPath) {
        throw new ApiError(400, "icon is not Updated Succesfully")
    }


    const icon = await uploadCloudinary(iconLocalPath);
    
    console.log(" icon  : "  , icon)
    // console.log("url of the upload file into cloudinary", avatar)
    // add into database 

    const SkillCreate = await Skill.create(
        {
            skillName,
            icon: icon?.url
        }
    )
    // console.log("document is created ", SkillCreate)
    // return a response

    res.status(201).json(new ApiResponse(200, "New Skill is created"))
})


const fetchSKill = asyncHandler(async (req, res) => {


    const skillDb = await Skill.find({})

    console.log("skillDb", skillDb)
    res.status(200).json(new ApiResponse(200, "Skill Section ", skillDb))
})

const deleteSkill = asyncHandler(async (req,res)=>{

    console.log("req body " , req.body)

    const deleteSkillResponse = await Skill.deleteOne({_id:req.body.id})
    console.log("deleteSkillResponse : ", deleteSkillResponse)
    res.json(new ApiResponse(200 , "Skill is Delete Success fully"))
})
export { createSkill, fetchSKill, deleteSkill }