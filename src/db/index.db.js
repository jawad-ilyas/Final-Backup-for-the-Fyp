import mongoose from "mongoose"


const connectDb = (async () => {

    try {

        const connection = await mongoose.connect(process.env.DB_URL);
        console.log("connection result into db")
    } catch (error) {
        console.log('Error into db connection ', error)

    }

})
export { connectDb }