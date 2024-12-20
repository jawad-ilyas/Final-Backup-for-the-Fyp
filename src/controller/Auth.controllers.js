import User from '../models/Auth.models.js';
import { ApiResponse } from '../utilis/ApiResponse.js';
import { asyncHandler } from '../utilis/asyncHandler.utilis.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register User
export const registerUser = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json(new ApiResponse(400, 'User already exists'));
    }

    // Create user

    const newUser = await User.create({ email, password, name });
    console.log("new user into backend register user ", newUser)
    res.status(201).json(
        new ApiResponse(201, 'User registered successfully', {
            _id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            token: generateToken(newUser._id),
        })
    );
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.status(200).json(
            new ApiResponse(200, 'User logged in successfully --- Jawad Mughal', {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            })
        );
    } else {
        res.status(401).json(new ApiResponse(401, 'Invalid email or password'));
    }
});

// Fetch All Users
export const fetchUsers = asyncHandler(async (_, res) => {
    const users = await User.find();
    res.status(200).json(new ApiResponse(200, 'Fetched all users', users));
});

// Delete User
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (deletedUser) {
        res.status(200).json(new ApiResponse(200, 'User deleted successfully', deletedUser));
    } else {
        res.status(404).json(new ApiResponse(404, 'User not found'));
    }
});