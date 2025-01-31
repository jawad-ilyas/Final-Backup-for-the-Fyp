

export const removeElementWrapperTemplate = `


#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========

int main() {
    string inputLine;
    getline(cin, inputLine);

    // Parsing nums array
    auto startBracketPos = inputLine.find('[');
    auto endBracketPos = inputLine.find(']');
    if (startBracketPos == string::npos || endBracketPos == string::npos || endBracketPos < startBracketPos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
    int nums[1000], size = 0;
    {
        size_t pos = 0;
        while ((pos = numbersPart.find(',')) != string::npos) {
            nums[size++] = stoi(numbersPart.substr(0, pos));
            numbersPart.erase(0, pos + 1);
        }
        if (!numbersPart.empty()) {
            nums[size++] = stoi(numbersPart);
        }
    }

    // Parsing val
    int val = 0;
    auto valPos = inputLine.find("val =");
    if (valPos != string::npos) {
        valPos += 5; // Move past "val ="
        while (valPos < inputLine.size() && isspace((unsigned char)inputLine[valPos])) {
            valPos++;
        }
        val = stoi(inputLine.substr(valPos));
    } else {
        cerr << "Invalid input: 'val' not provided." << endl;
        return 1;
    }

    // Call the user's function
    int k = removeElement(nums, size, val);

    // Print only the count as per the expected format
    cout << k << endl;

    return 0;
}`;

export const twoSumWrapperTemplate = `

#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <unordered_set>

using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========

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
}`;

export const findtargetindicesaftersortingarrayWrapperTemplate = `

#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========

// ===============================================================

int main() {
    string inputLine;
    getline(cin, inputLine);

    // Parsing nums array
    auto startBracketPos = inputLine.find('[');
    auto endBracketPos = inputLine.find(']');
    if (startBracketPos == string::npos || endBracketPos == string::npos || endBracketPos < startBracketPos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
    int nums[100], size = 0;
    {
        size_t pos = 0;
        while ((pos = numbersPart.find(',')) != string::npos) {
            nums[size++] = stoi(numbersPart.substr(0, pos));
            numbersPart.erase(0, pos + 1);
        }
        if (!numbersPart.empty()) {
            nums[size++] = stoi(numbersPart);
        }
    }

    // Parsing target
    int target = 0;
    auto targetPos = inputLine.find("target =");
    if (targetPos != string::npos) {
        targetPos += 8; // Move past "target ="
        while (targetPos < inputLine.size() && isspace((unsigned char)inputLine[targetPos])) {
            targetPos++;
        }
        target = stoi(inputLine.substr(targetPos));
    } else {
        cerr << "Invalid input: 'target' not provided." << endl;
        return 1;
    }

    // Call the user function
    int result[100], resultSize;
    resultSize = findTargetIndices(nums, size, target, result);

    // Print the results
    cout << "[";
    for (int i = 0; i < resultSize; i++) {
        if (i > 0) cout << ",";
        cout << result[i];
    }
    cout << "]" << endl;

    return 0;
}
`;

export const majorityElementWrapperTemplate = `
#include <iostream>
#include <unordered_map>
#include <algorithm>

using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========


// ======================================================================

int main() {
    string inputLine;
    getline(cin, inputLine);

    // Parsing nums array
    auto startBracketPos = inputLine.find('[');
    auto endBracketPos = inputLine.find(']');
    if (startBracketPos == string::npos || endBracketPos == string::npos || endBracketPos < startBracketPos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
    int nums[100], size = 0;
    {
        size_t pos = 0;
        while ((pos = numbersPart.find(',')) != string::npos) {
            nums[size++] = stoi(numbersPart.substr(0, pos));
            numbersPart.erase(0, pos + 1);
        }
        if (!numbersPart.empty()) {
            nums[size++] = stoi(numbersPart);
        }
    }

    // Call the user function
    int majority = majorityElement(nums, size);

    // Print the result
    cout << majority << endl;

    return 0;
}
`;

export const containsDuplicateWrapperTemplate = `



#include <iostream>
#include <unordered_set>
#include <algorithm>
#include <unordered_map>

using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========


// ======================================================================

int main() {
    string inputLine;
    getline(cin, inputLine);

    // Parsing nums array
    auto startBracketPos = inputLine.find('[');
    auto endBracketPos = inputLine.find(']');
    if (startBracketPos == string::npos || endBracketPos == string::npos || endBracketPos < startBracketPos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
    int nums[100], size = 0;
    {
        size_t pos = 0;
        while ((pos = numbersPart.find(',')) != string::npos) {
            nums[size++] = stoi(numbersPart.substr(0, pos));
            numbersPart.erase(0, pos + 1);
        }
        if (!numbersPart.empty()) {
            nums[size++] = stoi(numbersPart);
        }
    }

    // Call the user function
    bool result = containsDuplicate(nums, size);

    // Print the result
    cout << (result ? "true" : "false") << endl;

    return 0;
}













`;

export const missingNumberWrapperTemplate = `


#include <iostream>
using namespace std;


// ========== [USER_CODE_PLACEHOLDER] ==========


// ======================================================================

int main() {
    string inputLine;
    getline(cin, inputLine);

    // Parsing nums array
    auto startBracketPos = inputLine.find('[');
    auto endBracketPos = inputLine.find(']');
    if (startBracketPos == string::npos || endBracketPos == string::npos || endBracketPos < startBracketPos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
    int nums[100], size = 0;
    {
        size_t pos = 0;
        while ((pos = numbersPart.find(',')) != string::npos) {
            nums[size++] = stoi(numbersPart.substr(0, pos));
            numbersPart.erase(0, pos + 1);
        }
        if (!numbersPart.empty()) {
            nums[size++] = stoi(numbersPart);
        }
    }

    // Call the user function
    int result = missingNumber(nums, size);

    // Print the result
    cout << result << endl;

    return 0;
}













`;


export const intersectionOfTwoArraysWrapperTemplate = `
#include <iostream>
using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========


// ======================================================================

int main() {
    string inputLine;
    getline(cin, inputLine);

    // Parsing nums1 array
    auto startBracketPos = inputLine.find('[');
    auto endBracketPos = inputLine.find(']');
    if (startBracketPos == string::npos || endBracketPos == string::npos || endBracketPos < startBracketPos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
    int nums1[100], size1 = 0;
    {
        size_t pos = 0;
        while ((pos = numbersPart.find(',')) != string::npos) {
            nums1[size1++] = stoi(numbersPart.substr(0, pos));
            numbersPart.erase(0, pos + 1);
        }
        if (!numbersPart.empty()) {
            nums1[size1++] = stoi(numbersPart);
        }
    }

    // Parsing nums2 array (similarly)
    getline(cin, inputLine);
    numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
    int nums2[100], size2 = 0;
    {
        size_t pos = 0;
        while ((pos = numbersPart.find(',')) != string::npos) {
            nums2[size2++] = stoi(numbersPart.substr(0, pos));
            numbersPart.erase(0, pos + 1);
        }
        if (!numbersPart.empty()) {
            nums2[size2++] = stoi(numbersPart);
        }
    }

    int resultSize = 0;
    int* result = intersection(nums1, size1, nums2, size2, resultSize);

    // Printing the result
    cout << "[";
    for (int i = 0; i < resultSize; i++) {
        if (i > 0) cout << ",";
        cout << result[i];
    }
    cout << "]" << endl;

    // Free allocated memory
    delete[] result;

    return 0;
}


`;

export const thirdLargerWrapperTemplate = `

#include <iostream>
#include <climits>  // Include necessary header for LONG_MIN
using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========

// ======================================================================




int main() {
    string inputLine;
    getline(cin, inputLine); // Reading the entire input line

    // Parsing nums array
    auto startBracketPos = inputLine.find('[');
    auto endBracketPos = inputLine.find(']');
    if (startBracketPos == string::npos || endBracketPos == string::npos || endBracketPos < startBracketPos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
    int nums[100], size = 0;
    {
        size_t pos = 0;
        while ((pos = numbersPart.find(',')) != string::npos) {
            nums[size++] = stoi(numbersPart.substr(0, pos)); // Add integer to nums array
            numbersPart.erase(0, pos + 1); // Remove the processed part
        }
        if (!numbersPart.empty()) {
            nums[size++] = stoi(numbersPart); // Handle the last element
        }
    }

    // Call the user function
    int result = thirdMax(nums, size);

    // Print the result
    cout << result << endl;

    return 0;
}




`;


export const fariCandySwapWrapperTemplate = `

#include <iostream>
#include <unordered_set>
#include <unordered_map>


using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========

// ======================================================================

int main() {
    string inputLine;
    getline(cin, inputLine); // Read the entire input line

    // Split into alicePart and bobPart using ", " as delimiter
    size_t splitPos = inputLine.find(", ");
    if (splitPos == string::npos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string alicePart = inputLine.substr(0, splitPos);
    string bobPart = inputLine.substr(splitPos + 2); // Skip ", "

    // Parse aliceSizes
    int aliceSizes[100], sizeAlice = 0;
    {
        auto start = alicePart.find('[');
        auto end = alicePart.find(']');
        string numsStr = alicePart.substr(start + 1, end - start - 1);
        size_t pos = 0;
        while ((pos = numsStr.find(',')) != string::npos) {
            aliceSizes[sizeAlice++] = stoi(numsStr.substr(0, pos));
            numsStr.erase(0, pos + 1);
        }
        if (!numsStr.empty()) {
            aliceSizes[sizeAlice++] = stoi(numsStr);
        }
    }

    // Parse bobSizes
    int bobSizes[100], sizeBob = 0;
    {
        auto start = bobPart.find('[');
        auto end = bobPart.find(']');
        string numsStr = bobPart.substr(start + 1, end - start - 1);
        size_t pos = 0;
        while ((pos = numsStr.find(',')) != string::npos) {
            bobSizes[sizeBob++] = stoi(numsStr.substr(0, pos));
            numsStr.erase(0, pos + 1);
        }
        if (!numsStr.empty()) {
            bobSizes[sizeBob++] = stoi(numsStr);
        }
    }

    // Call the user function
    int answer[2];
    findExchangeBox(aliceSizes, sizeAlice, bobSizes, sizeBob, answer);

    cout << "[" << answer[0] << "," << answer[1] << "]" << endl;
    return 0;
}

`;


export const SortArrayByParityWrapperTemplate = `

#include <iostream>
using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========

// ======================================================================

int main() {
    string inputLine;
    getline(cin, inputLine); // Reading the entire input line for nums

    // Parsing the nums array
    auto startBracketPos = inputLine.find('[');
    auto endBracketPos = inputLine.find(']');
    if (startBracketPos == string::npos || endBracketPos == string::npos || endBracketPos < startBracketPos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
    int nums[100], size = 0;
    {
        size_t pos = 0;
        while ((pos = numbersPart.find(',')) != string::npos) {
            nums[size++] = stoi(numbersPart.substr(0, pos)); // Add integer to nums array
            numbersPart.erase(0, pos + 1); // Remove the processed part
        }
        if (!numbersPart.empty()) {
            nums[size++] = stoi(numbersPart); // Handle the last element
        }
    }

    // Call the user function (replace with your function name)
    moveEvenOdd(nums, size); // Assuming moveEvenOdd is the function you are using to solve the problem

    // Print the result in expected format (with brackets)
    cout << "[";
    for (int i = 0; i < size; i++) {
        cout << nums[i];
        if (i < size - 1) cout << ", ";  // Add comma between elements
    }
    cout << "]" << endl;

    return 0;
}
`;


export const MaximumProductofTwoElementsinanArrayWrapperTemplate = `



#include <iostream>
#include <unordered_set>
#include <algorithm>
#include <unordered_map>


// ========== [USER_CODE_PLACEHOLDER] ==========

// ======================================================================

int main() {
    string inputLine;
    getline(cin, inputLine); // Reading the entire input line for nums

    // Parsing the nums array
    auto startBracketPos = inputLine.find('[');
    auto endBracketPos = inputLine.find(']');
    if (startBracketPos == string::npos || endBracketPos == string::npos || endBracketPos < startBracketPos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string numbersPart = inputLine.substr(startBracketPos + 1, endBracketPos - (startBracketPos + 1));
    int nums[100], size = 0;
    {
        size_t pos = 0;
        while ((pos = numbersPart.find(',')) != string::npos) {
            nums[size++] = stoi(numbersPart.substr(0, pos)); // Add integer to nums array
            numbersPart.erase(0, pos + 1); // Remove the processed part
        }
        if (!numbersPart.empty()) {
            nums[size++] = stoi(numbersPart); // Handle the last element
        }
    }

    // Call the user function to find the maximum product
    int result = maxProduct(nums, size);

    // Print the result
    cout << result << endl;

    return 0;
}


`;



export const minMovesToSeatWrapperTemplate = `

#include <iostream>
#include <algorithm>

using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========

// ======================================================================

int main() {
    string inputLine;
    getline(cin, inputLine); // Read the entire input line

    // Split into seatsPart and studentsPart using ", " as delimiter
    size_t splitPos = inputLine.find(", ");
    if (splitPos == string::npos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string seatsPart = inputLine.substr(0, splitPos);
    string studentsPart = inputLine.substr(splitPos + 2); // Skip ", "

    // Parse seats array
    int seats[100], sizeSeats = 0;
    {
        auto start = seatsPart.find('[');
        auto end = seatsPart.find(']');
        string numsStr = seatsPart.substr(start + 1, end - start - 1);
        size_t pos = 0;
        while ((pos = numsStr.find(',')) != string::npos) {
            seats[sizeSeats++] = stoi(numsStr.substr(0, pos));
            numsStr.erase(0, pos + 1);
        }
        if (!numsStr.empty()) {
            seats[sizeSeats++] = stoi(numsStr);
        }
    }

    // Parse students array
    int students[100], sizeStudents = 0;
    {
        auto start = studentsPart.find('[');
        auto end = studentsPart.find(']');
        string numsStr = studentsPart.substr(start + 1, end - start - 1);
        size_t pos = 0;
        while ((pos = numsStr.find(',')) != string::npos) {
            students[sizeStudents++] = stoi(numsStr.substr(0, pos));
            numsStr.erase(0, pos + 1);
        }
        if (!numsStr.empty()) {
            students[sizeStudents++] = stoi(numsStr);
        }
    }

    // Call the user function
    int result = minMovesToSeat(seats, sizeSeats, students, sizeStudents);

    cout << result << endl;
    return 0;
}

`;


export const maxProductDifferenceWrapperTemplate = `

#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>

using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========

int maxProductDifference(vector<int>& nums); // Declare function

int main() {
    string inputLine;
    getline(cin, inputLine); // Read input

    // Parse nums array
    vector<int> nums;
    auto start = inputLine.find('[');
    auto end = inputLine.find(']');
    string numsStr = inputLine.substr(start + 1, end - start - 1);
    size_t pos = 0;
    while ((pos = numsStr.find(',')) != string::npos) {
        nums.push_back(stoi(numsStr.substr(0, pos)));
        numsStr.erase(0, pos + 1);
    }
    if (!numsStr.empty()) {
        nums.push_back(stoi(numsStr));
    }

    // Call function and print result
    int result = maxProductDifference(nums);
    cout << result << endl;  // Ensure output is printed
    return 0;
}





`;





export const sortThePeopleWrapperTemplate = `

#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

// ========== [USER_CODE_PLACEHOLDER] ==========

// ======================================================================

int main() {
    string inputLine;
    getline(cin, inputLine); // Read the entire input line

    // Split into namesPart and heightsPart using ", " as delimiter
    size_t splitPos = inputLine.find(", ");
    if (splitPos == string::npos) {
        cerr << "Invalid input format." << endl;
        return 1;
    }

    string namesPart = inputLine.substr(0, splitPos);
    string heightsPart = inputLine.substr(splitPos + 2); // Skip ", "

    // Parse names
    vector<string> names;
    {
        auto start = namesPart.find('[');
        auto end = namesPart.find(']');
        string namesStr = namesPart.substr(start + 1, end - start - 1);
        stringstream ss(namesStr);
        string name;
        while (getline(ss, name, ',')) {
            name.erase(remove(name.begin(), name.end(), '"'), name.end()); // Remove quotes
            name.erase(0, name.find_first_not_of(" "));
            name.erase(name.find_last_not_of(" ") + 1);
            names.push_back(name);
        }
    }

    // Parse heights
    vector<int> heights;
    {
        auto start = heightsPart.find('[');
        auto end = heightsPart.find(']');
        string numsStr = heightsPart.substr(start + 1, end - start - 1);
        stringstream ss(numsStr);
        int height;
        while (ss >> height) {
            heights.push_back(height);
            if (ss.peek() == ',') ss.ignore();
        }
    }

    // Call the user function
    vector<string> sortedNames = sortPeople(names, heights);

    // Print the result
    cout << "[";
    for (size_t i = 0; i < sortedNames.size(); ++i) {
        cout << "" << sortedNames[i] << "";
        if (i < sortedNames.size() - 1) cout << ", ";
    }
    cout << "]" << endl;

    return 0;
}


`;