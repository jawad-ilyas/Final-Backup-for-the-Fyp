class ApiError extends Error {

    constructor(statusCode, message, error = [], stack) {
        super(message)
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.data = null
        this.error = error
        // Check if a stack trace is provided
        if (stack) {
            // If provided, set the stack property to the provided stack trace
            this.stack = stack;
        } else {
            // If not provided, capture the stack trace and assign it to the stack property
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {ApiError}