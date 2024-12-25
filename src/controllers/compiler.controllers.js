import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export const runStudentCode = asyncHandler(async (req, res) => {
    const { code, language, testCases } = req.body;

    if (!code) {
        throw new ApiError(400, "No code provided");
    }

    // check that user wants C++ in this demo
    if (language !== "cpp") {
        throw new ApiError(400, "Only C++ is supported in this demo");
    }

    // create a unique file name to avoid collisions
    // e.g., we can add a timestamp or random ID
    const timestamp = Date.now();
    const cppFilePath = path.join(process.cwd(), `tempCode_${timestamp}.cpp`);
    const exeFilePath = path.join(process.cwd(), `tempExe_${timestamp}`);

    // write the code to a .cpp file
    fs.writeFileSync(cppFilePath, code, "utf-8");

    try {
        // 1) COMPILE with g++
        // -o <output_path> = name of the compiled binary
        // -std=c++17 or whichever version you want
        const compileCmd = `g++ -std=c++17 -o "${exeFilePath}" "${cppFilePath}"`;

        await runCommand(compileCmd);

        // 2) For each test case, run the binary with input
        // compare output vs expected
        let passCount = 0;
        const totalCount = testCases?.length || 0;
        let combinedOutput = "";

        for (let i = 0; i < totalCount; i++) {
            const input = testCases[i].input;
            const expected = testCases[i].expected;

            // run the compiled binary, pass input as argument or feed it in via echo
            // We'll do the “argument” approach for simplicity:
            const runResult = await runCommand(`${exeFilePath} "${input}"`);
            combinedOutput += `Test #${i + 1}\nInput: ${input}\nOutput: ${runResult}\n\n`;

            if (runResult.trim() === expected.trim()) {
                passCount++;
            }
        }

        // If no testcases, just run once with no input
        if (totalCount === 0) {
            const runResult = await runCommand(`${exeFilePath}`);
            combinedOutput += runResult;
        }

        // Cleanup: remove the .cpp and the compiled binary
        fs.unlinkSync(cppFilePath);
        fs.unlinkSync(exeFilePath);

        // Return results
        res.status(200).json(
            new ApiResponse(200, "Code run successfully", {
                output: combinedOutput,
                passCount,
                totalCount,
            })
        );
    } catch (err) {
        // If there's an error (compilation or runtime), cleanup files
        if (fs.existsSync(cppFilePath)) fs.unlinkSync(cppFilePath);
        if (fs.existsSync(exeFilePath)) fs.unlinkSync(exeFilePath);

        // Return the error message as output
        throw new ApiError(500, err.toString());
    }
});

/**
 * Helper to run a shell command and return stdout or throw on error.
 */
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                // e.g. compile error or runtime error
                return reject(stderr || err.message);
            }
            resolve(stdout);
        });
    });
}
