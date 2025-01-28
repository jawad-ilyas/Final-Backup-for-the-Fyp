export default function wrapUserCode(userCode, testCases) {
    let wrappedCode = `
    #include <iostream>
    #include <vector>
    using namespace std;

    // User-submitted function
    ${userCode}

    int main() {
        vector<pair<vector<int>, int>> testCases = {
    `;

    // Add test cases dynamically
    testCases.forEach(({ input }, index) => {
        const match = input.match(/nums = \[([^\]]+)\], target = (\d+)/);
        if (!match) {
            throw new Error(`Invalid input format for test case ${index + 1}`);
        }

        const nums = match[1].split(",").map(num => parseInt(num.trim()));
        const target = parseInt(match[2]);

        wrappedCode += `{ { ${nums.join(", ")} }, ${target} },\n`;
    });

    wrappedCode += `
        };

        vector<vector<int>> expectedOutputs = {
    `;

    testCases.forEach(({ output }) => {
        const parsedExpected = output.trim().replace(/^\[|\]$/g, "").split(",").map(num => parseInt(num));
        wrappedCode += `{ ${parsedExpected.join(", ")} },\n`;
    });

    wrappedCode += `
        };

        // Iterate through test cases
        for (size_t i = 0; i < testCases.size(); ++i) {
            vector<int> nums = testCases[i].first;
            int target = testCases[i].second;

            // Convert vector<int> to raw array for compatibility
            int rawNums[nums.size()];
            for (size_t j = 0; j < nums.size(); ++j) {
                rawNums[j] = nums[j];
            }

            // Call user's function
            int* result = twoSum(rawNums, nums.size(), target);

            // Print results in Judge0-compatible format
            cout << "[" << result[0] << "," << result[1] << "]" << endl;
        }

        return 0;
    }
    `;

    return wrappedCode;
}
