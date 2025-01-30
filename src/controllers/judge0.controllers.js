import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import axios from "axios";
import { buildWrapperCode } from "../wrappers/buildWrapperCode.js"; // the function from step #2
import evaluateCode from "../../services/generateScore.js";

// 1) The wrapper generator from above
// function buildWrapperCode(userFunctionCode) {
//     return `
// #include <iostream>
// #include <vector>
// #include <string>
// #include <sstream>
// using namespace std;

// // =================== [ User's Function Code ] ===================
// ${userFunctionCode}
// // ===============================================================

// int main() {
//     string inputLine;
//     getline(cin, inputLine);

//     auto startBracketPos = inputLine.find('[');
//     auto endBracketPos   = inputLine.find(']');
//     if (startBracketPos == string::npos || endBracketPos == string::npos || endBracketPos < startBracketPos) {
//         return 0;
//     }

//     string numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
//     vector<int> nums;
//     {
//         stringstream ss(numbersPart);
//         while (ss.good()) {
//             string token;
//             getline(ss, token, ',');
//             while (!token.empty() && isspace((unsigned char)token.front())) token.erase(token.begin());
//             while (!token.empty() && isspace((unsigned char)token.back()))  token.pop_back();
//             if (!token.empty()) {
//                 nums.push_back(stoi(token));
//             }
//         }
//     }

//     int targetVal = 0;
//     {
//         auto tpos = inputLine.find("target =");
//         if (tpos != string::npos) {
//             tpos += 7; 
//             while (tpos < inputLine.size() && (inputLine[tpos] == '=' || isspace((unsigned char)inputLine[tpos]))) {
//                 tpos++;
//             }
//             int sign = 1;
//             if (tpos < inputLine.size() && inputLine[tpos] == '-') {
//                 sign = -1;
//                 tpos++;
//             }
//             long val = 0;
//             while (tpos < inputLine.size() && isdigit((unsigned char)inputLine[tpos])) {
//                 val = val * 10 + (inputLine[tpos] - '0');
//                 tpos++;
//             }
//             targetVal = (int)(sign * val);
//         }
//     }

//     findTwoSum(nums, targetVal);

//     return 0;
// }
// `;
// }

/**
 * POST /api/v1/compiler/run
 * Body: { code, language, testCases, totalMarks }
 */
export const runStudentCodeJudge0 = asyncHandler(async (req, res) => {
    const {
        code,
        language,
        question,
        questionId,    // <--- dynamic question ID
        testCases,
        totalMarks
    } = req.body;
    // console.log("code", code)
    // console.log("language", language)
    // console.log("questionId", questionId)
    // console.log("testCases", testCases)
    // console.log("totalMarks", totalMarks)

    if (!code) {
        throw new ApiError(400, "No code provided.");
    }

    // We only have a few languages in this example
    const languageMap = {
        cpp14: 52,
        cpp17: 54
    };
    const langId = languageMap[language];
    if (!langId) {
        throw new ApiError(400, `Language '${language}' not supported.`);
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
        throw new ApiError(400, "No test cases provided.");
    }

    // 1) Build final code using the questionId-specific wrapper
    let finalCode;
    try {
        finalCode = buildWrapperCode(code, questionId);
        // console.log("final code print out is this ", finalCode)
    } catch (err) {
        throw new ApiError(400, err.message);
    }

    // Prepare Judge0
    const judge0Url = "https://judge029.p.rapidapi.com/submissions?base64_encoded=false&wait=true&fields=*";
    const headers = {
        "Content-Type": "application/json",
        "x-rapidapi-key": "05110206a9mshda2512decd38751p174847jsncffb02117c93",
        // "x-rapidapi-key": "99fad6767fmsh4823a64f4ce7c31p1ea611jsn31949c21cf31",
        "x-rapidapi-host": "judge029.p.rapidapi.com"
    };

    //   console.log("header of the api " , headers)

    let passCount = 0;
    const totalCount = testCases.length;
    // console.log("total test cases ", totalCount);
    const results = [];

    async function submitOneTestCase(stdinInput) {
        try {
            const response = await axios.post(
                judge0Url,
                {
                    source_code: finalCode,
                    language_id: langId,
                    stdin: stdinInput
                },
                { headers }
            );
            return response.data;
        } catch (err) {
            return { compile_output: `Error: ${err.message}` };
        }
    }

    // 2) Process each test case
    for (let i = 0; i < totalCount; i++) {
        const { input, output: expectedOutput } = testCases[i];

        // Each test => compile & run the final code with this "input"
        const result = await submitOneTestCase(input);

        //    console.log("result of the test cases is this : ", i, result)
        const { stdout, stderr, compile_output } = result;
        //    console.log("stdout of the test cases is this : ", i, stdout)
        //    console.log("stderr of the test cases is this : ", i, stderr)
        //    console.log("compile_output of the test cases is this : ", i, compile_output)


        let status = "Failed";
        let actual = "";

        if (compile_output) {
            actual = `Compile Error:\n${compile_output}`;
        } else if (stderr) {
            actual = `Runtime Error:\n${stderr}`;
        } else if (stdout !== undefined && stdout !== null) {
            actual = stdout.trim();
            // Compare output (string or JSON approach, your choice)
            const normalize = (str) => str.replace(/\s+/g, "");
            if (normalize(actual) === normalize(expectedOutput.trim())) {
                passCount++;
                status = "Passed";
            }
        } else {
            actual = "No output generated.";
        }

        results.push({
            testCase: i + 1,
            input,
            expected: expectedOutput,
            actual,
            status
        });
    }

    // 3) Calculate final score and return

    //    ! this line defined who much we need to give number to pass all the test cases 
    const score = Math.round((passCount / totalCount) * (totalMarks / 2));

    const ModelReponse = await evaluateCode(question, code, passCount, (totalMarks / 2))
    console.log("response is", ModelReponse)

    const { correctnessScore, efficiencyScore, edgeCaseScore, readabilityScore, bestPracticesScore, feedback } = ModelReponse
    console.log("score is this ", score)
    console.log("correctnessScore is this ", correctnessScore)
    console.log("efficiencyScore is this ", efficiencyScore)
    console.log("edgeCaseScore is this ", edgeCaseScore)
    console.log("readabilityScore is this ", readabilityScore)
    console.log("bestPracticesScore is this ", bestPracticesScore)
    console.log("feedback is this ", feedback)
    const ModelScore = correctnessScore + efficiencyScore + edgeCaseScore + readabilityScore + bestPracticesScore;
    res.status(200).json(
        new ApiResponse(200, "Code executed successfully", {
            output: feedback,
            passCount,
            totalCount,
            score: ModelScore + score,
            totalMarks,
            results
        })
    );


});