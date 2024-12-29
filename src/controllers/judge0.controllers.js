// controllers/judge0.controllers.js

import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import axios from "axios";

/**
 * POST /api/v1/compiler/run
 * Body: {
 *    code: string,
 *    language: "cpp17" | "cpp14" | "c" | "python3" | "java",
 *    testCases: [
 *      { _id?: string, input: string, output: string },
 *      { ... }
 *    ]
 * }
 *
 * This loops over the testCases array, calls Judge0 once per test case, 
 * and compares actual vs. expected output.
 */
export const runStudentCodeJudge0 = asyncHandler(async (req, res) => {
    const { code, language, testCases } = req.body;

    if (!code) {
        throw new ApiError(400, "No code provided");
    }

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
        throw new ApiError(400, "No test cases provided or invalid format");
    }

    // Map your desired language strings to Judge0's language_id
    const languageMap = {
        cpp14: 52,
        cpp17: 54,
        c: 50,
        python3: 71,
        java: 62,
    };

    const langId = languageMap[language];
    if (!langId) {
        throw new ApiError(400, `Language '${language}' not supported in this demo`);
    }

    const judge0Url =
        "https://judge029.p.rapidapi.com/submissions?base64_encoded=false&wait=true&fields=*";

    // We'll store each test case's results in this array
    const results = [];

    for (const testCase of testCases) {
        const { _id, input, output: expectedOutput } = testCase;

        // Prepare request body for Judge0
        // We'll pass code + language_id + optional "stdin"
        // so the user code can read from standard input
        const submissionBody = {
            source_code: code,
            language_id: langId,
            stdin: input, // pass the test case's input as stdin
        };

        try {
            const response = await axios.post(judge0Url, submissionBody, {
                headers: {
                    "Content-Type": "application/json",
                    "x-rapidapi-key": "YOUR_RAPIDAPI_KEY_HERE",   // replace with your key
                    "x-rapidapi-host": "judge029.p.rapidapi.com", // or your judge0 host
                },
            });

            // Judge0 returns fields like compile_output, stderr, stdout
            const { stdout, stderr, compile_output } = response.data;

            let combinedOutput = "";
            let success = false;

            if (compile_output) {
                combinedOutput += `Compile Error:\n${compile_output}\n`;
            } else if (stderr) {
                combinedOutput += `Runtime Error:\n${stderr}\n`;
            } else {
                // No compile or runtime error => we have stdout
                combinedOutput += stdout || "";
                // Compare actual to expected
                success = combinedOutput.trim() === (expectedOutput || "").trim();
            }

            results.push({
                testCaseId: _id || null, // optional
                input,
                expectedOutput,
                actualOutput: combinedOutput.trim(),
                success,
            });
        } catch (err) {
            // If Judge0 call fails or something else goes wrong
            results.push({
                testCaseId: _id || null,
                input,
                expectedOutput,
                actualOutput: null,
                success: false,
                error: `Judge0 request failed: ${err.message}`,
            });
        }
    }

    // Return results array
    res.status(200).json(
        new ApiResponse(200, "Test case execution completed", { results })
    );
});
