import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import axios from "axios";
import  wrapUserCode  from "../utils/wrappers.utils.js";
/**
 * POST /api/v1/compiler/run
 * Body: { code, language, testCases }
 * - `code`: (optionally base64-encoded) C++ code
 * - `language`: e.g. "cpp14" or "cpp17" if you want to differentiate
 * - `testCases`: array of objects { input: "...", expected: "..." }
 *
 * This uses RapidAPI's "judge029.p.rapidapi.com" endpoint with wait=true
 * for synchronous results.
 */
export const runStudentCodeJudge0 = asyncHandler(async (req, res) => {
    console.log("Line 14: Request body received:", req.body);

    const { code, language, testCases, totalMarks } = req.body;

    if (!code) {
        console.log("Line 18: No code provided.");
        throw new ApiError(400, "No code provided");
    }

    const languageMap = {
        cpp14: 52,
        cpp17: 54,
    };

    const langId = languageMap[language];
    console.log("Line 25: Mapped language ID:", langId);

    if (!langId) {
        console.log(`Line 28: Unsupported language '${language}' provided.`);
        throw new ApiError(400, `Language '${language}' not supported in this demo`);
    }

    const judge0Url =
        "https://judge029.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=compile_output";


    async function submitOneTestCase(input, expected, userCode, testCases) {
        console.log("Expected output is", expected);

        // Wrap the user-submitted code with test cases
        const wrappedCode = wrapUserCode(userCode, testCases);

        const body = {
            source_code: Buffer.from(wrappedCode).toString("base64"), // Encode the wrapped code
            language_id: langId,
            stdin: "", // No stdin required for this problem
        };

        console.log("Line 39: Submitting wrapped code:", wrappedCode);

        const response = await axios.post(judge0Url, body, {
            headers: {
                "Content-Type": "application/json",
                "x-rapidapi-key": "03792f3ef2msh0a399f9707481e0p161bd2jsnff0604eef7e1",
                "x-rapidapi-host": "judge029.p.rapidapi.com",
            },
        });

        console.log("Line 49: Received response from Judge0 API:", response.data);
        return response.data;
    }


    const results = [];
    let totalAwardedMarks = 0;
    const marksPerTestCase = totalMarks / testCases.length; // Equal marks per test case
    console.log("Line 56: Marks per test case:", marksPerTestCase);

    let passCount = 0;

   
 
 
    for (let i = 0; i < testCases.length; i++) {
        const { input, output: expected } = testCases[i];

        try {
            console.log(`Submitting test case ${i + 1}...`);
            const result = await submitOneTestCase(input, expected, code, testCases);
            console.log(`Received response for test case ${i + 1}:`, result);

            const { stdout, stderr, compile_output } = result;

            const resultData = {
                testCase: i + 1,
                input,
                expectedOutput: expected.trim(), // Trim extra spaces
                actualOutput: stdout ? stdout.trim() : "", // Capture stdout
                passed: false,
                error: null,
            };

            if (compile_output) {
                resultData.error = `Compile Error: ${Buffer.from(compile_output, "base64").toString("utf-8")}`;
                console.log(`Compile Error in test case ${i + 1}:`, resultData.error);
            } else if (stderr) {
                resultData.error = `Runtime Error: ${Buffer.from(stderr, "base64").toString("utf-8")}`;
                console.log(`Runtime Error in test case ${i + 1}:`, resultData.error);
            } else {
                // Normalize actualOutput and expectedOutput for comparison
                const normalizedActual = resultData.actualOutput.replace(/\s+/g, "").trim();
                const normalizedExpected = resultData.expectedOutput.replace(/\s+/g, "").trim();

                // Compare outputs
                resultData.passed = normalizedActual === normalizedExpected;
                if (!resultData.passed) {
                    console.log(`Mismatch in test case ${i + 1}:`);
                    console.log(`Actual Output: "${normalizedActual}"`);
                    console.log(`Expected Output: "${normalizedExpected}"`);
                }
            }

            results.push(resultData);
        } catch (err) {
            console.log(`Error in test case ${i + 1}:`, err.message);
            results.push({
                testCase: i + 1,
                input,
                expectedOutput: expected,
                actualOutput: null,
                passed: false,
                error: `Judge0 Request Failed: ${err.message}`,
            });
        }
    }
    console.log("Final results:", results);





    console.log("Line 99: Final results:", results);

    res.status(200).json(
        new ApiResponse(200, "Code run and test cases evaluated", {
            results,
            passCount,
            totalCount: testCases.length,
            totalMarks: totalAwardedMarks,
        })
    );
});
