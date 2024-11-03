// Importing the Mongoose package
const mongoose = require('mongoose');

// Defining the Mongo URI for Database
// Now, Defining the Database of SpendWell

// For Online Mongo Atlas
// const mongoURI = "mongodb+srv://dbUser:dbUserPassword@dbcluster.pqt7lhm.mongodb.net/SpendWell";

// For Local MongoDB
const mongoURI = "mongodb://127.0.0.1:27017/SpendWell";

// Checking whether the node js is connected to mongoose or not
const connectToMongoCluster = async () => {
    try {
        const db = await mongoose.connect(mongoURI);
        console.log("Connection Successfull !");
        return db;
    } catch (error) {
        console.log("Connection Failed : ",error);
    }
}

// Exporting the connectToMongoCluster function
module.exports = connectToMongoCluster