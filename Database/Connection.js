// Importing the Mongoose package
const mongoose = require('mongoose');

// Importing the dotenv for JWT_SECRET_KEY access
const dotenv = require('dotenv');

// Getting the Environment Variables from the env file
dotenv.config();

// Defining the Mongo URI for Database
// Now, Defining the Database of SpendWell

// For Local MongoDB
//const mongoURI = "mongodb://127.0.0.1:27017/SpendWell";

// Checking whether the node js is connected to mongoose or not
const connectToMongoCluster = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        console.log("Connection Successfull !");
        return db;
    } catch (error) {
        console.log("Connection Failed : ",error);
    }
}

// Exporting the connectToMongoCluster function
module.exports = connectToMongoCluster