import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import axios from "axios";

// 1) The wrapper generator from above
function buildWrapperCode(userFunctionCode) {
    return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

// =================== [ User's Function Code ] ===================
${userFunctionCode}
// ===============================================================

int main() {
    string inputLine;
    getline(cin, inputLine);

    auto startBracketPos = inputLine.find('[');
    auto endBracketPos   = inputLine.find(']');
    if (startBracketPos == string::npos || endBracketPos == string::npos || endBracketPos < startBracketPos) {
        return 0;
    }

    string numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
    vector<int> nums;
    {
        stringstream ss(numbersPart);
        while (ss.good()) {
            string token;
            getline(ss, token, ',');
            while (!token.empty() && isspace((unsigned char)token.front())) token.erase(token.begin());
            while (!token.empty() && isspace((unsigned char)token.back()))  token.pop_back();
            if (!token.empty()) {
                nums.push_back(stoi(token));
            }
        }
    }

    int targetVal = 0;
    {
        auto tpos = inputLine.find("target =");
        if (tpos != string::npos) {
            tpos += 7; 
            while (tpos < inputLine.size() && (inputLine[tpos] == '=' || isspace((unsigned char)inputLine[tpos]))) {
                tpos++;
            }
            int sign = 1;
            if (tpos < inputLine.size() && inputLine[tpos] == '-') {
                sign = -1;
                tpos++;
            }
            long val = 0;
            while (tpos < inputLine.size() && isdigit((unsigned char)inputLine[tpos])) {
                val = val * 10 + (inputLine[tpos] - '0');
                tpos++;
            }
            targetVal = (int)(sign * val);
        }
    }

    findTwoSum(nums, targetVal);

    return 0;
}
`;
}

/**
 * POST /api/v1/compiler/run
 * Body: { code, language, testCases, totalMarks }
 */
export const runStudentCodeJudge0 = asyncHandler(async (req, res) => {
    const { code, language, question, questionId, testCases, totalMarks = 10 } = req.body;
    console.log("question statement  questionId : ", questionId)
    if (!code) {
        throw new ApiError(400, "No code provided.");
    }

    const languageMap = {
        cpp14: 52,
        cpp17: 54
        // add more if needed
    };
    const langId = languageMap[language];
    if (!langId) {
        throw new ApiError(400, `Language '${language}' not supported.`);
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
        throw new ApiError(400, "No test cases provided.");
    }

    // 2) Build the final code (user code + wrapper)
    const finalCode = buildWrapperCode(code);
    console.log("final code : ", finalCode)
    const judge0Url =
        "https://judge029.p.rapidapi.com/submissions?base64_encoded=false&wait=true&fields=*";

    const headers = {
        "Content-Type": "application/json",
        "x-rapidapi-key": "03792f3ef2msh0a399f9707481e0p161bd2jsnff0604eef7e1",
        "x-rapidapi-host": "judge029.p.rapidapi.com"
    };

    let passCount = 0;
    const totalCount = testCases.length;
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

    // 3) Process each test case
    for (let i = 0; i < totalCount; i++) {
        const { input, output: expectedOutput } = testCases[i];

        // Send the "nums = [x,y,z], target = N" line as stdin
        const result = await submitOneTestCase(input);
        const { stdout, stderr, compile_output } = result;

        let status = "Failed";
        let actual = "";

        if (compile_output) {
            actual = `Compile Error:\n${compile_output}`;
        } else if (stderr) {
            actual = `Runtime Error:\n${stderr}`;
        } else if (stdout !== undefined && stdout !== null) {
            actual = stdout.trim();
            if (expectedOutput) {
                try {
                    // Parse both as JSON objects
                    const actualJson = JSON.parse(actual);
                    const expectedJson = JSON.parse(expectedOutput.trim());

                    // Compare the parsed objects
                    if (JSON.stringify(actualJson) === JSON.stringify(expectedJson)) {
                        passCount++;
                        status = "Passed";
                    }
                } catch (err) {
                    // If parsing fails, fall back to string comparison
                    if (actual === expectedOutput.trim()) {
                        passCount++;
                        status = "Passed";
                    }
                }
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

    // 4) Score
    const score = Math.round((passCount / totalCount) * totalMarks);

    res.status(200).json(
        new ApiResponse(200, "Code executed successfully", {
            passCount,
            totalCount,
            score,
            totalMarks,
            results
        })
    );
});
