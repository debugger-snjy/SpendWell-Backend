const mongoose = require('mongoose');

// Defining the Schema for the User
const UserSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    creationDate: {
        type:Date,
        default: () => new Date(),
        required: true,
    },
    updationDate: {
        type:Date,
    },
    // For Soft Delete
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    deleteReason: {
        type: String
    }
});

// Exporting the model: 
// model takes a name and the schema
const User = mongoose.model("User", UserSchema);
module.exports = User;