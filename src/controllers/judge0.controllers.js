// controllers/judge0.controllers.js

import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import axios from "axios";
import { evaluateCode } from "../utils/generateScore.js";

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
    console.log("judge0 is called for this program ")
    const { code, language, testCases, question, totalMarks } = req.body;
    if (!code) {
        throw new ApiError(400, "No code provided");
    }

    // Suppose we only handle C++14/17 via RapidAPI.
    // For C++14, we typically pass language_id=52 to Judge0. For C++17 -> 54, etc.
    const languageMap = {
        cpp14: 52,
        cpp17: 54,
    };

    // const langId = languageMap[language];
    // if (!langId) {
    //     throw new ApiError(400, `Language '${language}' not supported in this demo`);
    // }

    // We'll do a naive approach: for each testCase, we create a submission,
    // then compare actual output with expected. We'll accumulate passCount, combinedOutput, etc.
    // let passCount = 0;
    // const totalCount = testCases?.length || 0;
    // let combinedOutput = "";

    // // 1) The base submission URL:
    // //    We include "?base64_encoded=true" only if your `code` is base64. 
    // //    Also "wait=true" means we'll get the result in one shot.
    // const judge0Url =
    //     "https://judge029.p.rapidapi.com/submissions?base64_encoded=false&wait=true&fields=*";

    // // 2) We'll define a helper function to call Judge0 for a single test case:
    // async function submitOneTestCase(input) {
    //     // "source_code" is the code (base64 if you'd like).
    //     // "stdin" is the input. 
    //     // "language_id" is e.g. 52 for C++14
    //     const body = {
    //         source_code: code,
    //         language_id: langId,
    //         stdin: input,
    //         // You can also pass "expected_output" if you want Judge0 to compare automatically.
    //     };

    //     // Make sure you use your actual RapidAPI key in the headers below:
    //     const response = await axios.post(judge0Url, body, {
    //         headers: {
    //             "Content-Type": "application/json",
    //             'x-rapidapi-key': '03792f3ef2msh0a399f9707481e0p161bd2jsnff0604eef7e1',
    //             "x-rapidapi-host": "judge029.p.rapidapi.com",
    //         },
    //     });

    //     return response.data;
    // }

    // // 3) For each test case
    // for (let i = 0; i < totalCount; i++) {
    //     const input = testCases[i].input;
    //     const expected = testCases[i].expected?.trim() || "";
    //     // call Judge0
    //     let outputText = "";
    //     try {
    //         const result = await submitOneTestCase(input);
    //         const { stdout, stderr, compile_output } = result;

    //         if (compile_output) {
    //             // means compile error
    //             outputText = `Compile Error:\n${compile_output}\n`;
    //         } else if (stderr) {
    //             // runtime error
    //             outputText = `Runtime Error:\n${stderr}\n`;
    //         } else {
    //             // success => compare stdout with expected
    //             const actual = (stdout || "").trim();
    //             outputText = `Output: ${actual}\n`;
    //             if (actual === expected) {
    //                 passCount++;
    //             }
    //         }
    //     } catch (err) {
    //         outputText = `Judge0 Request Failed: ${err.message}\n`;
    //     }

    //     combinedOutput += `Test #${i + 1}\nInput: ${input}\n${outputText}\n`;
    // }

    // // 4) if no testCases, just do a single run
    // if (totalCount === 0) {
    //     try {
    //         const result = await submitOneTestCase("");
    //         const { stdout, stderr, compile_output } = result;
    //         if (compile_output) {
    //             combinedOutput += `Compile Error:\n${compile_output}\n`;
    //         } else if (stderr) {
    //             combinedOutput += `Runtime Error:\n${stderr}\n`;
    //         } else {
    //             combinedOutput += stdout || "";
    //         }
    //     } catch (err) {
    //         combinedOutput += `Judge0 Request Failed: ${err.message}\n`;
    //     }
    // }

    // totalMarks = 10
    const test = [
        {
            sampleOutput: 'Input: events = [[1,2],[2,5],[3,9],[1,15]] | Output: 1'
        },
        { sampleOutput: 'Input: events = [[10,5],[1,7]] | Output: 10' }
    ]

    console.log("test case", testCases)

    // const openAiResponse = await evaluateCode(question, code, testCases, totalMarks)
    // console.log("response is", openAiResponse)
    res.status(200).json(
        new ApiResponse(200, "Code run with Judge0 via RapidAPI", {
            output: openAiResponse?.feedback,
            passCount: openAiResponse?.totalPass,
            totalCount: testCases?.length,
            score: openAiResponse?.score,
            totalMarks: totalMarks
        })
    );
});
