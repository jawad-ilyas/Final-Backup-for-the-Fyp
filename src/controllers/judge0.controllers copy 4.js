import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import axios from "axios";

/**
 * POST /api/v1/compiler/run
 * Body: { code, language, testCases, totalMarks }
 */
export const runStudentCodeJudge0 = asyncHandler(async (req, res) => {
    const { code, language, testCases, totalMarks = 10 } = req.body;

    // Debugging inputs
    console.log("DEBUG: Received Request Data");
    // console.log("Code:", code);
    // console.log("Language:", language);
    // console.log("Test Cases:", JSON.stringify(testCases, null, 2));

    if (!code) {
        console.error("ERROR: No code provided.");
        throw new ApiError(400, "No code provided.");
    }

    const languageMap = {
        cpp14: 52,
        cpp17: 54,
        // Add more languages if needed
    };

    const langId = languageMap[language];
    if (!langId) {
        console.error(`ERROR: Language '${language}' not supported.`);
        throw new ApiError(400, `Language '${language}' not supported.`);
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
        console.error("ERROR: No test cases provided.");
        throw new ApiError(400, "No test cases provided.");
    }

    const judge0Url =
        "https://judge029.p.rapidapi.com/submissions?base64_encoded=false&wait=true&fields=*";

    const headers = {
        "Content-Type": "application/json",
        "x-rapidapi-key": "03792f3ef2msh0a399f9707481e0p161bd2jsnff0604eef7e1",
        "x-rapidapi-host": "judge029.p.rapidapi.com",
    };

    let passCount = 0;
    const totalCount = testCases.length;
    const results = [];

    // Helper function to submit a single test case
    const submitOneTestCase = async (input) => {
        const body = {
            source_code: code,
            language_id: langId,
            stdin: input,
            // NOTE: We remove expected_output, so we do the comparison ourselves
        };

        try {
            const response = await axios.post(judge0Url, body, { headers });
            console.log("DEBUG: Judge0 API response:", JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (err) {
            console.error(`ERROR: Judge0 request failed: ${err.message}`);
            return { compile_output: `Error: ${err.message}` };
        }
    };

    // Process all test cases
    for (let i = 0; i < totalCount; i++) {
        const { input, output: expectedOutput } = testCases[i];
        console.log(`DEBUG: Processing Test Case #${i + 1}`);
        console.log("Input:", input);
        console.log("Expected Output:", expectedOutput);

        const result = await submitOneTestCase(input);
        const { stdout, stderr, compile_output } = result;

        console.log("DEBUG: Test Case Result:", result);

        let status = "Failed";
        let actual = "";

        if (compile_output) {
            // Handle compilation errors
            actual = `Compile Error:\n${compile_output}`;
            console.error(`ERROR: Compilation failed for Test Case #${i + 1}`);
        } else if (stderr) {
            // Handle runtime errors
            actual = `Runtime Error:\n${stderr}`;
            console.error(`ERROR: Runtime error for Test Case #${i + 1}`);
        } else if (stdout !== undefined && stdout !== null) {
            // Handle valid output and compare with expected
            actual = stdout.trim(); // trim to avoid extra newline/spaces
            console.log(`DEBUG: Actual Output for Test Case #${i + 1}:`, actual);
            if (expectedOutput && actual === expectedOutput.trim()) {
                passCount++;
                status = "Passed";
                console.log(`DEBUG: Test Case #${i + 1} Passed.`);
            } else {
                console.warn(
                    `WARNING: Test Case #${i + 1} Failed. Expected "${expectedOutput?.trim()}" but got "${actual}".`
                );
            }
        } else {
            // If no stdout, fallback to undefined output
            actual = "No output generated.";
            console.warn(`WARNING: No output generated for Test Case #${i + 1}.`);
        }

        results.push({
            testCase: i + 1,
            input,
            expected: expectedOutput,
            actual,
            status,
        });
    }

    console.log("DEBUG: Total Passed Test Cases:", passCount);

    const score = Math.round((passCount / totalCount) * totalMarks);
    console.log("DEBUG: Calculated Score:", score);

    // Return response
    res.status(200).json(
        new ApiResponse(200, "Code executed successfully", {
            passCount,
            totalCount,
            score,
            totalMarks,
            results,
        })
    );
});
