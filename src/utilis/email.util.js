// utils/email.util.js
import nodemailer from "nodemailer";

export const sendEnrollmentEmail = async (studentEmail, courseName) => {
    // Use Gmail’s SMTP settings
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,            // or 465 if you want secure: true
        secure: false,        // true for port 465
        auth: {
            user: "mughaljawad12@gmail.com",
            pass: "wdtb xhgq uynm wamx", // your 16-char app password
        },
    });

    const mailOptions = {
        from: '"Course System" <mughaljawad12@gmail.com>',
        to: studentEmail,
        subject: `You have been enrolled in ${courseName}`,
        text: `Hello,
        You have been enrolled in the course: ${courseName}.

        Please log in or sign up to access your course materials.
        Thanks!`,
    };

    await transporter.sendMail(mailOptions);
};
