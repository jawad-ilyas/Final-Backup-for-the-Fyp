import axios from "axios";
const OPENAI_API_URL = process.env.OPENAI_API_URL_ENV;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY_ENV;

/**
 * Evaluate user code against example outputs and calculate a score.c
 *
 * @param {string} userCode - The code provided by the user.
 * @param {Array<{input: string, expectedOutput: string}>} testCases - Array of test cases with inputs and expected outputs.
 * @param {number} totalMarks - Total marks available for the code evaluation.
 * @param {number} [temperature=0.7] - The temperature for OpenAI response generation.
 * @param {number} [frequencyPenalty=0.5] - The frequency penalty for OpenAI response generation.
 * @returns {Promise<{score: number, feedback: string}>} - The calculated score and feedback from OpenAI.
 */
export const evaluateCode = async (question, userAnswer, sampleOutputs, totalMarks, temperature = 0.7, frequency_penalty = 0.5) => {

    try {

        console.log("userAnswer is", userAnswer)
        console.log("sampleOutputs are", sampleOutputs)
    const formattedSampleOutputs = sampleOutputs
                .map(
                    (output, index) =>
                        `Sample ${index + 1}:\n${output.input} | ${output.output}`
                )
                .join('\n');
    const formattedPrompt = `
                You are an AI assistant specializing in evaluating user code. Below is a question, the user's answer, and sample outputs. Evaluate the user's answer strictly against the provided sample outputs. Count the total number of outputs that passed and calculate the score as follows:

                Score = (Number of outputs passed / Total number of sample outputs) * ${totalMarks}

                Return only the following JSON response format:
                {
                    "score": <calculated score out of ${totalMarks}>,
                    "totalPass": <number of outputs that passed>,
                    "feedback": "<detailed feedback>"
                }

                Question:
                ${question}

                User's Answer:
                ${userAnswer}

                Sample Outputs:
                ${formattedSampleOutputs}

                Instructions:
                1. Evaluate the user's answer strictly against the provided sample outputs.
                2. Count the outputs that passed out of the total (${sampleOutputs.length}).
                3. Calculate the score using the formula provided above.
                4. Provide detailed feedback for each test case, explaining why it passed or failed.
                5. Return only the JSON object in the specified format.
            `;

            const messages = [
                { role: 'system', content: 'You are an AI assistant evaluating code based on provided test cases.' },
                { role: 'user', content: formattedPrompt }
            ];

            const response = await axios.post(OPENAI_API_URL, {
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: 500,
                temperature,
                frequency_penalty
            }, {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const aiResponse = response.data.choices[0].message.content;

            const parsedResponse = JSON.parse(aiResponse);
            return {
                score: parsedResponse.score,
                totalPass: parsedResponse.totalPass,
                feedback: parsedResponse.feedback
            };
    } catch (error) {
        console.error('Error during OpenAI evaluation request:', error.response?.data || error.message);

        if (error instanceof SyntaxError) {
            console.error('Failed to parse AI response as JSON:', error.message);
        }

        throw error;
    }
}