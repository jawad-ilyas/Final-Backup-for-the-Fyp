import { WRAPPER_TEMPLATES } from "./wrapperTemplates.js";

export const buildWrapperCode = (userFunctionCode, questionId) => {
    // 1) Pick the correct template by questionId
    const template = WRAPPER_TEMPLATES[questionId];
    console.log("template wrapper is this , template" , template)
    if (!template) {
        // If we don't have a matching template, throw an error or fallback
        throw new Error(`No wrapper template found for questionId = ${questionId}`);
    }

    // 2) Replace placeholder in the template with the user code
    // You could use a simple string replace or a more advanced templating approach
    const finalCode = template.replace(
        "// ========== [USER_CODE_PLACEHOLDER] ==========",
        userFunctionCode
    );

    return finalCode;
}
