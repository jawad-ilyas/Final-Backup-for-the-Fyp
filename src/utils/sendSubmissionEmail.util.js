// utils/email.util.js
import nodemailer from "nodemailer";

export const sendSubmissionEmail = async (studentEmail, studentName, courseName, moduleName, totalMarks, maxTotalMarks) => {
    // Use Gmail’s SMTP settings
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587, // or 465 if you want secure: true
        secure: false, // true for port 465
        auth: {
            user: "mughaljawad12@gmail.com",
            pass: "wdtb xhgq uynm wamx", // your 16-char app password
        },
    });

    const mailOptions = {
        from: '"IEFS Courses" <mughaljawad12@gmail.com>',
        to: studentEmail,
        subject: `Submission Confirmation for ${moduleName} - ${courseName}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: auto;
                    background: #ffffff;
                    border: 1px solid #dddddd;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(to right, #064e3b, #14b8a6);
                    color: #ffffff;
                    text-align: center;
                    padding: 20px 0;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    color: #333333;
                }
                .content p {
                    line-height: 1.6;
                    margin: 10px 0;
                }
                .footer {
                    background: #f1f5f9;
                    text-align: center;
                    padding: 15px 0;
                    font-size: 14px;
                    color: #666666;
                }
                .btn {
                    display: inline-block;
                    background-color: #14b8a6;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 0;
                    font-weight: bold;
                }
                .btn:hover {
                    background-color: #0d9488;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Submission Confirmation</h1>
                </div>
                <div class="content">
                    <p>Hi <strong>${studentName}</strong>,</p>
                    <p>We have received your submission for the following:</p>
                    <p><strong>Course:</strong> ${courseName}</p>
                    <p><strong>Module:</strong> ${moduleName}</p>
                    <p><strong>Total Marks:</strong> ${totalMarks}</p>
                    <p><strong> Marks you Get:</strong> ${maxTotalMarks}</p>
                    <p>Thank you for submitting your module. Keep up the great work!</p>
                </div>
                <div class="footer">
                    <p>IEFS Team</p>
                    <p><a href="https://ievc.example.com" style="color: #064e3b; text-decoration: none;">Visit our website</a></p>
                </div>
            </div>
        </body>
        </html>
        `,
    };

    await transporter.sendMail(mailOptions);
};
