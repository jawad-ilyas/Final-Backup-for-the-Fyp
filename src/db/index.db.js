import mongoose from "mongoose"


const connectDb = (async () => {

    try {

        
        const connection = await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to DB successfully")
    } catch (error) {
        console.log('Error into db connection ', error)

    }

})
export { connectDb }