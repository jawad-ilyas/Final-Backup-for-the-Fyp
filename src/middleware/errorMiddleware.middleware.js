import { ApiError } from "../utils/ApiError.utils.js";

const errorMiddleware = (err, req, res, next) => {
    console.error(err); // Log the error for debugging

    if (err instanceof ApiError) {
        // If the error is an instance of ApiError, use its properties
        res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            error: err.error,
            data: err.data,
        });
    } else {
        // For other types of errors, send a generic response
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: err.message,
            data: null,
        });
    }
};
export default errorMiddleware;
