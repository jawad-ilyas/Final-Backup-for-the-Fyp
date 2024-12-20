import { Experience } from "../models/Experience.models.js";
import { workExperience } from "../models/workExperience.models.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.utilis.js";


const createWorkExperience = asyncHandler(async (req, res) => {


    // console.log("createWorkExperience ", req.body)


    const { company, desc, name } = req.body


    const newWorkExperience = await workExperience.create({
        company,
        desc,
        name
    })


    res.status(201).json(
        new ApiResponse(200, "new Work Experience is created ", newWorkExperience)
    )

})

const createWork = asyncHandler(async (req, res) => {
    const { year, works } = req.body;

    console.log("createWork ", req.body);
    console.log("works ", works);
    console.log("year ", year);

    try {
        // Check if an Experience with the given year exists
        let experience = await Experience.findOne({ year });

        if (experience) {
            // If the Experience exists, update its works array
            experience.works = [...new Set([...experience.works, ...works])]; // Combine and remove duplicates
            await experience.save();

            res.status(200).json(
                new ApiResponse(200, "Work Experience updated successfully", experience)
            );
        } else {
            // If the Experience does not exist, create a new one
            const newExperience = await Experience.create({
                year,
                works,
            });

            res.status(201).json(
                new ApiResponse(200, "New Work Experience is created", newExperience)
            );
        }
    } catch (error) {
        console.error("Error creating/updating Work Experience:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

const fetchWorkExperience = asyncHandler(async (req, res) => {

    const WorkExperienceDb = await workExperience.find()


    res.status(200).json(
        new ApiResponse(200, "new Work Experience is created ", WorkExperienceDb)
    )

})
const deleteWorkExperience = asyncHandler(async (req, res) => {
    const id = req.params.id; // Extract id from request parameters

    // Here, you can use the id to delete the work experience record from the database
    // For example, using Mongoose to delete the record
    const WorkExperienceDel = await workExperience.findByIdAndDelete(id);

    if (WorkExperienceDel) {
        res.status(200).json(
            new ApiResponse(200, "Work Experience is deleted", WorkExperienceDel)
        );
    } else {
        res.status(404).json(
            new ApiResponse(404, "Work Experience not found", null)
        );
    }
});
export const deleteExperience = async (req, res) => {
    const { id } = req.params; // Extract the ID from request parameters

    try {
        // Find and delete the Experience document by ID
        const deletedExperience = await Experience.findOneAndDelete({ _id: id });

        if (!deletedExperience) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        // Delete the associated workExperience documents
        await workExperience.deleteMany({ _id: { $in: deletedExperience.works } });

        res.status(200).json(new ApiResponse(202, "delete experience is dn"));
    } catch (error) {
        console.error("Error deleting experience:", error);
        res.status(500).json({ message: 'Server error' });
    }
};


const fetchExperiences = async (_, res) => {
    try {
        // Fetch all Experience documents and populate the 'works' field with corresponding workExperience details
        const experiences = await Experience.find().populate('works');

        if (!experiences) {
            return res.status(404).json({ message: 'Experiences not found' });
        }
        console.log("fetch work experience ", experiences)
        res.status(200).json(new ApiResponse(200, "Fetch Works", experiences));
    } catch (error) {
        console.error("Error fetching experiences:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export { createWorkExperience, fetchWorkExperience, deleteWorkExperience, createWork, fetchExperiences }