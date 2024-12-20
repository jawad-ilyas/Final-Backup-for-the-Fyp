import { asyncHandler } from "../utilis/asyncHandler.utilis.js";
import { ApiError } from "../utilis/ApiError.utilis.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { NewsLetter } from "../models/NewsLetter.models.js";



const createNewsLetter = asyncHandler(async (req, res) => {

    const { email, message, name } = req.body;

    if (email === "" || message === "" || name === "") {
        console.log("jawad")
        throw new ApiError(500, "All Fields is Required")
    }


    const createnewsletterDb = await NewsLetter.create({
        email,
        message,
        name
    })

    res.status(201).json(
        new ApiResponse(200, "new newsletter is created", createnewsletterDb)
    )
})


// ! controller for fetch newsletter

const fetchNewsLetter = asyncHandler(async (req, res) => {

    const fetchNewsLetterDb = await NewsLetter.find();
    res.status(200).json(new ApiResponse(200, "Fetch NewsLetter Data", fetchNewsLetterDb))

})


const deleteNewsLetter = asyncHandler(async (req, res) => {

    const { id } = req.body

    console.log("id of the delete news letter ", id)
    const deleteNewsLetterDb = await NewsLetter.deleteOne({ _id: id })
    console.log(deleteNewsLetterDb)
    res.status(202).json(new ApiResponse(202 , "Contact NewsLetter is delete " , deleteNewsLetter))
})
export { createNewsLetter, fetchNewsLetter, deleteNewsLetter }