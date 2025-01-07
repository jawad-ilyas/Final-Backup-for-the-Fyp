import dotenv from "dotenv";
import express, { urlencoded } from "express";
import { connectDb } from "./db/index.db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./router/Auth.router.js";
import courseRouter from "./router/Course.router.js"
import moduleRoutes from "./router/Module.router.js";
import userProfileRoutes from "./router/User.router.js"; // Import user routes
import questionRouter from "./router/AddQuestion.router.js"; // Import Question Router
import teacherRoutes from "./router/teacher.router.js";
import studentRoutes from './router/student.routes.js';
import compilerRouter from "./router/compiler.routes.js"
import errorMiddleware from './middleware/errorMiddleware.middleware.js';
import submissionRoutes from "./router/submission.routes.js";

dotenv.config({
    path: "./.env",
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/modules", moduleRoutes);
app.use("/api/v1/user", userProfileRoutes);
app.use("/api/v1/questions", questionRouter); // Add Question Router
app.use("/api/v1/teachers", teacherRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/compiler', compilerRouter);
app.use("/api/v1/submissions", submissionRoutes);



// Add module routes
app.use(errorMiddleware);
connectDb()
    .then(() => {
        app.on("Error", (Error) => {
            console.log("Error", Error);
            throw new Error();
        });
        app.listen(process.env.PORT, () => {
            console.log(`http://localhost:${process.env.PORT}`, process.env.PORT);
        });
    })
    .catch(() => {
        console.log("Error into db connection Or server issue");
    });