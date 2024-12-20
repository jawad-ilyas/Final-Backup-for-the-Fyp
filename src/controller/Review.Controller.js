


import { Review } from "../models/Review.model.js";
import { ApiError } from "../utilis/ApiError.utilis.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { deleteCloudinary, uploadCloudinary } from "../utilis/Cloudinary.utilis.js";
import { asyncHandler } from "../utilis/asyncHandler.utilis.js";


// ! controller for create review 
const createReview = asyncHandler(async (req, res) => {


    // console.log("req .body into create review function  ", req.body)
    // console.log("review Image  create review function  ", req.file)
    const { name, description, company } = req.body;
    // console.log("Into create review function. Review Name:", name);
    // console.log("Review Description:", description);
    // console.log("Review company:", company);


    // * Checking the Review name is already present or not 
    const reviewFind = await Review.findOne({ name })
    // console.log(" reviewFind : ", reviewFind)
    if (reviewFind != null) {
        throw new ApiError(400, "Reivew is already Exists")
    }
    // valiate the image 
    const reviewImagePath = req.file?.path; // Contains information about the uploaded file

    if (!reviewImagePath) {
        throw new ApiError(400, "Review image  is not find Succesfully")
    }



    // * upload file on cloudinary and generate url 
    const reviewImageLink = await uploadCloudinary(reviewImagePath)
    // console.log("print the url of the review image after uplad to cloudinary ", reviewImageLink)

    // * create new Review 
    const createReviewDb = await Review.create({
        name,
        description,
        company,
        reviewImage: reviewImageLink?.url

    })


    //  * return the respones 

    console.log("createReviewDb :  ", createReviewDb)


    res.status(201).json(
        new ApiResponse(200, "Review is created ")
    )
})

// ! Controller for fetch review 


const fetchReview = asyncHandler(async (req, res) => {


    const fetchReviewDb = await Review.find();

    res.status(200).json(new ApiResponse(200, "Review is Fetched ", fetchReviewDb))

})

const deleteReview = asyncHandler(async (req, res) => {

    const { id } = req.body;
    console.log("body of the delete review ", id)


    const data = await Review.findById(id)

    console.log("data of the review delete section ", data)
    const reviewImgDeleteResult = await deleteCloudinary(data?.reviewImage)
    console.log("data of the review delete image ", reviewImgDeleteResult)
    if (reviewImgDeleteResult.result) {

        const deleteResponse = await Review.deleteOne({ _id: id });
        console.log("deleteResponse into delete review api fuction ", deleteResponse)
        res.json(new ApiResponse(200, "review is delete successfully"))
    }


})


const updateReview = asyncHandler(async (req, res) => {

    const { _id, name, description, company } = req.body

    console.log("req. body of the udpate review function  ", req.body)

    const fetchUpdateReviewData = await Review.findById(_id)
    // console.log("fetch update review data api " , fetchUpdateReviewData)
    if (fetchUpdateReviewData === null) {

        throw new ApiError(400, "Testominal is not present into backend ")
    }


    try {
        const updateReviewData = await Review.updateOne(
            { _id },
            { $set: { name, description, company } }
        );

        if (updateReviewData.nModified === 0) {
            throw new Error('Review not found or data is the same as the current values');
        }


        res.json(new ApiResponse(200, "Testominal is udpate "))
        console.log('Review updated successfully');
    } catch (error) {
        console.error('Error updating review:', error);
    }
})

export { createReview, fetchReview, deleteReview, updateReview }