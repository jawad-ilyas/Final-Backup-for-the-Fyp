import Submission from "../models/Submission.model.js";
import Question from "../models/AddQuestion.models.js";
import User from "../models/User.models.js";



// Helper: Update user stats for problem-solving progress
const updateUserStats = async (studentId, solutions) => {
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    // Iterate over submitted solutions and categorize by difficulty
    for (const sol of solutions) {
        const question = await Question.findById(sol.questionId);
        if (question) {
            const { difficulty } = question;
            if (sol.marksAwarded > 0) { // Only count if marks are awarded
                if (difficulty === "Easy") easyCount++;
                if (difficulty === "Medium") mediumCount++;
                if (difficulty === "Hard") hardCount++;
            }
        }
    }

    // Increment solved question stats in the User model
    await User.findByIdAndUpdate(
        studentId,
        {
            $inc: {
                totalSolved: easyCount + mediumCount + hardCount,
                easyCount,
                mediumCount,
                hardCount,
            },
        },
        { new: true }
    );
};

// Controller: Submit a module
export const submitModule = async (req, res) => {
    const { moduleId, courseId, teacherId, solutions, maxTotalMarks = 10 } = req.body;
    const studentId = req.user._id;

    console.log("moduleId", moduleId);
    console.log("courseId", courseId);
    console.log("teacherId", teacherId);
    console.log("solutions", solutions);
    console.log("maxTotalMarks", maxTotalMarks);
    console.log("studentId", studentId);

    try {
        // Create submission
        const submission = new Submission({
            course: courseId,
            module: moduleId,
            teacher: teacherId,
            student: studentId,
            questions: solutions.map((sol) => {
                const randomMarks = Math.floor(Math.random() * 10) + 1; // Random marks (1-10)
                return {
                    question: sol.questionId,
                    code: sol.code || "// No code provided",
                    output: sol.output || "No output generated",
                    marksAwarded: randomMarks,
                    remarks: "Good attempt. Keep improving!", // Fixed placeholder remarks
                    correctSolution: "// Correct solution placeholder", // Placeholder for correct solution
                    aiFeedback: "Focus on edge cases and complexity.", // Placeholder AI feedback
                };
            }),
            totalMarks: solutions.reduce((sum) => sum + Math.floor(Math.random() * 10) + 1, 0), // Sum of random marks
            maxTotalMarks,
        });

        const savedSubmission = await submission.save();

        // Update user stats
        await updateUserStats(studentId, solutions);

        // Populate fields for the response
        const populatedSubmission = await Submission.findById(savedSubmission._id)
            .populate("course")
            .populate("module")
            .populate("teacher")
            .populate("student")
            .populate("questions.question");

        res.status(201).json({
            success: true,
            message: "Submission created successfully!",
            data: populatedSubmission,
        });
    } catch (error) {
        console.error("Error submitting module:", error);
        res.status(500).json({ success: false, message: "Failed to submit module." });
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

    try {
        const submissions = await Submission.find({ course: courseId, student: studentId })
            .populate("course", "name description")
            .populate("module", "title description")
            .populate("teacher", "name email")
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
