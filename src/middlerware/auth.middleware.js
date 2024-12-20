import jwt from "jsonwebtoken";
import User from "../models/Auth.models.js";
import { asyncHandler } from "../utilis/asyncHandler.utilis.js";
import { ApiError } from "../utilis/ApiError.utilis.js";

export const protect = asyncHandler(async (req, res, next) => {
    let token;
    // console.log("req.headers.authorization ", req.headers.authorization)
   
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            throw new ApiError(401, "Not authorized, token failed");
        }
    }

    if (!token) {
        throw new ApiError(401, "Not authorized, no token provided");
    }
});
