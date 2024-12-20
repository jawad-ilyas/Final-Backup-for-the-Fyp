import { app } from "./app.js";
import dotenv from "dotenv"
import { connectDb } from "./db/index.db.js";

dotenv.config({
    path: "./.env"
})

connectDb()
    .then(() => {
        app.on("Error", (Error) => {
            console.log("Error", Error)
            throw new Error
        })
        app.listen(process.env.PORT, () => {

            console.log('app is listen on this port', process.env.PORT)
        })
    })
    .catch(() => {
        console.log("Error into db connection Or server issue ")
    })