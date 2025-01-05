import Submission from "../models/Submission.model.js";
import Question from "../models/AddQuestion.models.js";
import User from "../models/User.models.js";
import Module from "../models/Module.models.js";


// Helper: Update user stats for problem-solving progress
// Helper: Update user stats for problem-solving progress
const updateUserStats = async (studentId, solutions) => {
    // console.log(solutions)
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    const solvedQuestionIds = [];

    // Fetch the user to check already solved questions
    const user = await User.findById(studentId).select("solvedQuestions");
    // console.log(user, " into submit case ")

    const alreadySolved = new Set(user.solvedQuestions.map((q) => q.question.toString()));
    // Iterate over submitted solutions and categorize by difficulty
    for (const sol of solutions) {
        const question = await Question.findById(sol.questionId);
        // console.log(question, "question")
        if (question) {
            const { difficulty } = question;

            // Skip if the question is already solved
            if (alreadySolved.has(question._id.toString())) continue;

            // Categorize question by difficulty
            if (difficulty === "Easy") easyCount++;
            else if (difficulty === "Medium") mediumCount++;
            else if (difficulty === "Hard") hardCount++;

            // Add solved question ID to the array
            solvedQuestionIds.push({
                question: question._id,
                solvedAt: new Date(),
            });
        }
    }

    // Increment solved question stats and update solvedQuestions array in the User model
    const updatedUser = await User.findByIdAndUpdate(
        studentId,
        {
            $inc: {
                totalSolved: easyCount + mediumCount + hardCount,
                easyCount,
                mediumCount,
                hardCount,
            },
            $addToSet: {
                solvedQuestions: { $each: solvedQuestionIds }, // Add only unique questions
            },
        },
        { new: true }
    );

    // console.log("Updated User:", updatedUser);
};


export const submitModule = async (req, res) => {
    console.log("Submit Module - Started");
    const { moduleId, courseId, teacherId, solutions } = req.body;
    const studentId = req.user._id;

    try {
        // Check if the submission already exists
        console.log("Checking for existing submission...");
        const existingSubmission = await Submission.findOne({
            module: moduleId,
            student: studentId,
            course: courseId,
        });

        if (existingSubmission) {
            console.log("Existing submission found for module:", moduleId);
            return res.status(400).json({
                success: false,
                message: "You have already submitted this module.",
            });
        }

        console.log("Creating new submission...");
        const questions = solutions.map((sol) => {
            const maxMarks = sol.marks; // Max marks for the question
            if (!maxMarks || maxMarks <= 0) {
                throw new Error(`Invalid marks for question: ${sol.questionId}`);
            }

            const awardedMarks = Math.min(Math.floor(Math.random() * maxMarks) + 1, maxMarks); // Random marks <= maxMarks
            console.log(
                `Question: ${sol.questionId}, Max Marks: ${maxMarks}, Awarded Marks: ${awardedMarks}`
            );

            return {
                question: sol.questionId,
                code: sol.code || "// No code provided",
                output: sol.output || "No output generated",
                eachQuestionMark: sol.marks,
                marksAwarded: awardedMarks,
                remarks: "Good attempt. Keep improving!",
                correctSolution: "// Correct solution placeholder",
                aiFeedback: "Focus on edge cases and complexity.",
            };
        });

        const maxTotalMarks = questions.reduce((sum, question) => sum + question.marksAwarded, 0);
        const totalMarks = solutions.reduce((sum, sol) => sum + sol.marks, 0); // Sum of the `marks` key

        console.log(`Total Marks Awarded: ${totalMarks}`);
        console.log(`Maximum Total Marks: ${maxTotalMarks}`);

        const submission = new Submission({
            course: courseId,
            module: moduleId,
            teacher: teacherId,
            student: studentId,
            questions,
            totalMarks,
            maxTotalMarks,
        });

        console.log("Saving submission...");
        const savedSubmission = await submission.save();

        console.log("Updating user stats...");
        await updateUserStats(studentId, solutions);

        console.log("Populating submission fields...");
        const populatedSubmission = await Submission.findById(savedSubmission._id)
            .populate("course")
            .populate("module")
            .populate("teacher")
            .populate("student")
            .populate("questions.question");

        console.log("Submission created successfully!");
        res.status(201).json({
            success: true,
            message: "Submission created successfully!",
            data: populatedSubmission,
        });
    } catch (error) {
        console.error("Error submitting module:", error.message);
        res.status(500).json({ success: false, message: error.message || "Failed to submit module." });
    }
};





// Controller: Fetch submissions for a student
export const getSubmissionsByStudent = async (req, res) => {
    const studentId = req.user._id;

    try {
        const submissions = await Submission.find({ student: studentId })
            .populate("course module teacher questions.question");

        res.status(200).json({
            success: true,
            data: submissions,
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ success: false, message: "Failed to fetch submissions." });
    }
};

// Controller: Fetch single submission
export const getSubmissionById = async (req, res) => {
    // console.log("submission by id is called for the fetching of th esubmission");
    try {
        const submission = await Submission.findById(req.params.id)
            .populate("course module teacher questions.question");

        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found." });
        }

        res.status(200).json({ success: true, data: submission });
    } catch (error) {
        console.error("Error fetching submission:", error);
        res.status(500).json({ success: false, message: "Failed to fetch submission." });
    }
};


export const getSubmissionsByCourseAndStudent = async (req, res) => {
    const { courseId } = req.params; // Fetch course ID from URL params
    const studentId = req.user._id; // Fetch student ID from authenticated user
    const { moduleId } = req.query;

    // console.log("submission by id is called for the fetching of th esubmission getSubmissionsByCourseAndStudent", moduleId);

    try {
        const submissions = await Submission.find({ course: courseId, student: studentId, module: moduleId })
            .populate("course", "name description")
            .populate("module", "title description")
            .populate("teacher", "name email")
            .populate("student", "name email totalSolved easyCount mediumCount hardCount")
            .populate("questions.question", "title difficulty sampleTestCases");

        if (!submissions || submissions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No submissions found for this course and student.",
            });
        }

        res.status(200).json({
            success: true,
            data: submissions,
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch submissions.",
        });
    }
};



// Controller: This controller handle the single question where user solve the problem for the practice case 
export const submitSingleQuestion = async (req, res) => {
    const { questionId, code, output } = req.body; // Expect single question data
    const { studentId } = req.params;
    // console.log("studentId", studentId)
    try {
        // console.log(questionId, code, output, studentId);
        // Validate input
        if (!questionId) {
            return res.status(400).json({
                success: false,
                message: "Question ID is required.",
            });
        }




        // Update user stats for practicing
        await updateUserStats(studentId, [{ questionId }]);



        res.status(201).json({
            success: true,
            message: "Practice submission saved successfully!",
            data: "Question submitted successfully!",
        });
    } catch (error) {
        console.error("Error submitting question:", error);
        res.status(500).json({ success: false, message: "Failed to save practice submission." });
    }
};


// !---- controllers for the admin section + teacher section ----

// Controller: Fetch submissions by teacher, course, and module
export const getSubmissionsByTeacherCourseModule = async (req, res) => {
    const { teacherId, courseId, moduleId } = req.params; // Extract from URL params

    try {
        // Validate input
        if (!teacherId || !courseId || !moduleId) {
            return res.status(400).json({
                success: false,
                message: "Teacher ID, Course ID, and Module ID are required.",
            });
        }

        // Fetch the module to get the max marks for each question
        const module = await Module.findById(moduleId).populate("questions.question", "marks title");

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module not found.",
            });
        }


        // Fetch submissions matching the criteria
        const submissions = await Submission.find({
            teacher: teacherId,
            course: courseId,
            module: moduleId,
        })
            .populate("student", "name email totalSolved easyCount mediumCount hardCount") // Populate student details
            .populate("questions.question", "title difficulty sampleTestCases") // Populate question details
            .populate("teacher", "name") // Populate teacher details
            .populate("module", "title description") // Populate module details
            .populate("course", "name description"); // Populate course details

        if (!submissions || submissions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No submissions found for the specified criteria.",
            });
        }

        // Add marks for each question and compute total marks obtained
        const enrichedSubmissions = submissions.map((submission) => {
            const questionsWithMarks = submission.questions.map((q) => {
                const maxMarks = module.questions.find(
                    (moduleQuestion) =>
                        moduleQuestion.question.toString() === q.question._id.toString()
                )?.eachQuestionMark;
                console.log(maxMarks)
                return {
                    ...q.toObject(),
                    maxMarks: maxMarks || 0, // Include max marks from the module
                };
            });



            return {
                ...submission.toObject(),
                questions: questionsWithMarks, // Include questions with max marks

            };
        });

        // Respond with enriched submissions
        res.status(200).json({
            success: true,
            data: enrichedSubmissions,
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch submissions.",
        });
    }
};


export const deleteSubmission = async (req, res) => {
    const { teacherId, studentId, courseId, moduleId } = req.params;

    try {
        // Validate input
        if (!teacherId || !studentId || !courseId || !moduleId) {
            return res.status(400).json({
                success: false,
                message: "Teacher ID, Student ID, Course ID, and Module ID are required.",
            });
        }

        // Find the submission to delete
        const submission = await Submission.findOneAndDelete({
            teacher: teacherId,
            student: studentId,
            course: courseId,
            module: moduleId,
        });

        // If no submission found
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "No submission found for the specified criteria.",
            });
        }

        // Respond with success
        res.status(200).json({
            success: true,
            message: "Submission deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting submission:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete submission.",
        });
    }
};


// Controller: Update Marks for a Single Question in Submission

export const updateQuestionMarks = async (req, res) => {
    const { submissionId, questionId } = req.params;
    const { marksAwarded } = req.body;

    console.log("Request received to update marks for submission:", submissionId, "and question:", questionId);
    console.log("Marks to be awarded:", marksAwarded);

    try {
        // Validate marksAwarded input
        if (marksAwarded < 0) {
            console.log("Validation failed: Marks cannot be negative.");
            return res.status(400).json({
                success: false,
                message: "Marks cannot be negative.",
            });
        }

        // Find the submission
        console.log("Searching for submission with ID:", submissionId);
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            console.log("Submission not found with ID:", submissionId);
            return res.status(404).json({
                success: false,
                message: "Submission not found.",
            });
        }

        // Find the specific question in the submission
        console.log("Searching for question in submission...");
        const questionToUpdate = submission.questions.find(
            (q) => q.question.toString() === questionId
        );

        if (!questionToUpdate) {
            console.log("Question not found with ID:", questionId, "in submission:", submissionId);
            return res.status(404).json({
                success: false,
                message: "Question not found in the submission.",
            });
        }

        // Ensure the marks awarded do not exceed the maximum allowed marks for the question
        console.log("Validating marks awarded against maximum allowed marks...");
        if (marksAwarded > questionToUpdate.eachQuestionMark) {
            console.log(
                `Validation failed: Marks awarded (${marksAwarded}) exceed the maximum allowed marks (${questionToUpdate.eachQuestionMark}).`
            );
            return res.status(400).json({
                success: false,
                message: `Marks awarded cannot exceed the maximum allowed marks of ${questionToUpdate.eachQuestionMark}.`,
            });
        }

        // Update marks
        console.log("Updating marks for question:", questionId, "in submission:", submissionId);
        questionToUpdate.marksAwarded = marksAwarded;

        // Recalculate totalMarks and maxTotalMarks for the submission
        console.log("Recalculating totalMarks and maxTotalMarks for the submission...");
        submission.totalMarks = submission.questions.reduce(
            (sum, question) => sum + question.eachQuestionMark, 
            0
        );
        submission.maxTotalMarks = submission.questions.reduce(
            (sum, question) => sum + question.marksAwarded,
            0
        );

        // Save the updated submission
        console.log("Saving the updated submission...");
        await submission.save();

        console.log("Marks updated successfully for question:", questionId);
        res.status(200).json({
            success: true,
            message: "Marks updated successfully.",
            data: submission,
        });
    } catch (error) {
        console.error("Error updating question marks:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update question marks.",
        });
    }
};
