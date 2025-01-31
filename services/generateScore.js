import axios from "axios";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

const OPENAI_API_URL = process.env.OPENAI_API_URL_ENV;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY_ENV;

// Log API URL and Key for debugging
console.log("OPENAI_API_URL:", OPENAI_API_URL);
console.log("OPENAI_API_KEY:", OPENAI_API_KEY);

export const evaluateCode = async (question, userAnswer, passCount, totalMarks, temperature = 0.7, frequency_penalty = 0.5) => {
    try {
        // console.log("userAnswer is \n", userAnswer);
        // console.log("question is : ", question);
        // console.log("testCases is", testCases);
        // console.log("totalMarks is", totalMarks);


        // Updated Prompt: Focus on Correctness, Efficiency, Edge Cases, Readability, and Best Practices
        const formattedPrompt = `
            You are an AI assistant specializing in evaluating user code. Below is a question and the user's answer. Evaluate the user's answer based on the following criteria:
            
            1. **Correctness**: Does the code solve the problem as described in the question? Assign up to ${totalMarks * 0.4} marks.
            2. **Efficiency**: Is the code optimized in terms of time and space complexity? Assign up to ${totalMarks * 0.3} marks.
            3. **Edge Case Handling**: Does the code handle edge cases effectively? Assign up to ${totalMarks * 0.07} marks.
            4. **Readability**: Is the code easy to understand, with clear variable names and structure? Assign up to ${totalMarks * 0.09} marks.
            5. **Best Practices**: Does the code follow standard coding conventions and principles? Assign up to ${totalMarks * 0.08} marks.

            Return only the following JSON response format:
            {
                "score": <calculated score out of ${totalMarks}>,
                "correctnessScore": <marks for correctness>,
                "efficiencyScore": <marks for efficiency>,
                "edgeCaseScore": <marks for edge case handling>,
                "readabilityScore": <marks for readability>,
                "bestPracticesScore": <marks for best practices>,
                "feedback": "<detailed feedback>"
            }

            Question:
            ${question}

            User's Answer:
            ${userAnswer}

            Instructions:
            - Analyze the user's code thoroughly.
            - Provide detailed feedback for each criterion, explaining the reasoning behind the assigned scores.
            - Ensure the total score does not exceed ${totalMarks}.
        `;

        // Messages for OpenAI API
        const messages = [
            { role: 'system', content: 'You are an AI assistant evaluating code based on correctness, efficiency, edge case handling, readability, and best practices.' },
            { role: 'user', content: formattedPrompt }
        ];
        // console.log("message send to the model : , " , messages)
        // OpenAI API Request
        const response = await axios.post(OPENAI_API_URL, {
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 800,
            temperature,
            frequency_penalty
        }, {
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        // console.log("response of the model  : , ", response)

        // Parse AI Response
        const aiResponse = response.data.choices[0].message.content;
        console.log("model response with out jsong formate ", aiResponse);
        const parsedResponse = JSON.parse(aiResponse);
        console.log("response of the model  : , ", parsedResponse)


        // Parse AI Response
        // const parsedResponse = response.data.choices[0].message.content;
        // console.log("model response with out jsong formate ", parsedResponse);
        // // const parsedResponse = JSON.parse(aiResponse);
        // // console.log("response of the model  : , ", parsedResponse)


        return {
            score: parsedResponse.score,
            correctnessScore: parsedResponse.correctnessScore,
            efficiencyScore: parsedResponse.efficiencyScore,
            edgeCaseScore: parsedResponse.edgeCaseScore,
            readabilityScore: parsedResponse.readabilityScore,
            bestPracticesScore: parsedResponse.bestPracticesScore,
            feedback: parsedResponse.feedback
        };
    } catch (error) {
        console.error('Error during OpenAI evaluation request:', error.response?.data || error.message);
        if (error instanceof SyntaxError) {
            console.error('Failed to parse AI response as JSON:', error.message);
        }
        throw error;
    }
};

export default evaluateCode;