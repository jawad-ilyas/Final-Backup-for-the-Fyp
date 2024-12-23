import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['admin', 'student', 'teacher'],
            default: 'student',
        },
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],

        // NEW OPTIONAL FIELDS FOR TEACHER PROFILE
      
        imageUrl: {
            type: String,
            default: '/images/default.jpg', // or null
        },
        branding: {
            type: Boolean,
            default: false,
        },
        reports: {
            type: Boolean,
            default: false,
        },
        includeInEmails: {
            type: Boolean,
            default: false,
        },
        gradeLevel : {
            type: String,
            trim: true,
        },
        major : {
            type: String,
            trim: true,
        },
        // Social links
        twitter: { type: String, trim: true },
        facebook: { type: String, trim: true },
        linkedin: { type: String, trim: true },
    },
    { timestamps: true }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Example index if you often query by role
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User;
