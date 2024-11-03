const mongoose = require('mongoose');

// Defining the Schema for the User
const NotesSchema = new mongoose.Schema({
    // Adding user in it for making it more specific
    // And using this we will only fetch notes of tha user only not any other user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        // We will give reference to the user model ==> It like a foreign key
        // Refer line no 26 as we have created a moongoose model
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    tags: {
        type: String,
        default: "General"
    },
    date: {
        type: Date,
        default: () => new Date(),
    },
});

// Exporting the model: 
// model takes a name and the schema
module.exports = mongoose.model("notes", NotesSchema);