// controllers/judge0.controllers.js

import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import axios from "axios";

/**
 * POST /api/v1/compiler/run
 * Body: { code, language, stdin? } // optional single input
 * 
 * This uses RapidAPI's "judge029.p.rapidapi.com" endpoint with ?wait=true
 * for synchronous results. No multiple test-case loop.
 */
export const runStudentCodeJudge0 = asyncHandler(async (req, res) => {
    const { code, language, stdin } = req.body;
    if (!code) {
        throw new ApiError(400, "No code provided");
    }

    // Suppose we only handle a few languages:
    const languageMap = {
        cpp14: 52,
        cpp17: 54,
        c: 50,
        python3: 71,
        java: 62,
        // etc...
    };

    const langId = languageMap[language];
    if (!langId) {
        throw new ApiError(400, `Language '${language}' not supported in this demo`);
    }

    // We'll just do ONE submission to Judge0:
    const judge0Url =
        "https://judge029.p.rapidapi.com/submissions?base64_encoded=false&wait=true&fields=*";

    // Prepare the request body for Judge0
    const submissionBody = {
        source_code: code,    // If you want to pass base64, do base64_encoded=true & encode code
        language_id: langId,
        stdin: stdin || "",   // optional input
    };

    try {
        // Call Judge0 once
        const response = await axios.post(judge0Url, submissionBody, {
            headers: {
                "Content-Type": "application/json",
                'x-rapidapi-key': '03792f3ef2msh0a399f9707481e0p161bd2jsnff0604eef7e1',
                "x-rapidapi-host": "judge029.p.rapidapi.com",
            },
        });

        // Extract results
        const { stdout, stderr, compile_output } = response.data;

        let combinedOutput = "";

        if (compile_output) {
            // compile error
            combinedOutput += `Compile Error:\n${compile_output}\n`;
        } else if (stderr) {
            // runtime error
            combinedOutput += `Runtime Error:\n${stderr}\n`;
        } else {
            // success => stdout is the code's output
            combinedOutput += stdout || "";
        }

        // Respond
        res.status(200).json(
            new ApiResponse(200, "Single-run code execution via Judge0", {
                output: combinedOutput,
            })
        );
    } catch (err) {
        // If Judge0 request fails (403, 429, etc.)
        throw new ApiError(500, `Judge0 request failed: ${err.message}`);
    }
});
