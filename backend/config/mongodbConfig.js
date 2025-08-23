import mongoose from 'mongoose'

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("Database Connection Established");
    })
    mongoose.connection.on('error', (err) => {
        console.error(error);
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/Occasio`)
}

export default connectDB;