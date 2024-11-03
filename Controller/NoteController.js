// Importing the notes schema from User Mongoose Model
const Notes = require("../Models/Notes");

// Importing the express-validator
const { validationResult } = require('express-validator');

exports.fetchallnotes = async (req, res) => {

    // Making a Variable to track the success or not
    let status = "";
    let msg = "";

    // TODO : fetching it by user id (student/faculty)
    try {
        // Finding all the notes 
        // Also to be specific, we have to add the user in the parameter to find notes of only that user
        const notes = await Notes.find({ user: req.user.id });
        console.log("Your Notes : !!")
        return res.json(notes);
    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

exports.addNote = async (req, res) => {

    // Making a Variable to track the success or not
    let status = "";
    let msg = "";

    try {
        console.log("Here, You can Add Note Here !")

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Note Not Added Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no errors are present or found

        // Destructing Data from body
        const { title, description, tags } = req.body;

        // TODO : Add user id through Middleware (student/faculty)
        // Creating a Note 
        const note = new Notes({ title, description, tags, user: req.user.id })

        // Saving note in database
        const savedNote = await note.save();

        // Setting up the parameters
        status = "success";
        msg = "Note Added Successfully"

        // returning the saved note Details
        return res.status(200).json({ status: status, msg: msg, savedNote })
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Note Not Added Successfully"
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }

}

exports.updateNote = async (req, res) => {

    // Making a Variable to track the success or not
    let status = "";
    let msg = "";

    try {
        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Note Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no errors are present or found
        const { title, description, tags } = req.body;

        // Create a newNote Object with the new Updated Data 
        const newNote = {
            title: title,
            description: description,
            tags: tags
        }

        // Finding whether the same user who created note is updating or not

        // Finding the note from the database, whether the note exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const note = await Notes.findById(req.params.id);

        // If that note doesn't exists, then returning the Bad Response
        if (!note) {

            // Setting up the parameters
            status = "failed";
            msg = "Note Not Updated Successfully"

            // return res.status(404).json({ status: status, msg: msg, error : "Note Not Found !"})
            return res.status(404).json({ status: status, msg: msg, error: "Note Not Found !" });
        }

        // If note exists in database, then getting its user
        // and then comparing that with the user which has been logged in (From where we get this ?)
        // We will get the id of user which is logged in from the middle ware or from the fetchUser function
        // TODO : Create a user and middleware
        if (note.user.toString() !== req.user.id) {
            // the note don't belong to that user and should not have any right ot update
            // 401 - Unauthorized

            // Setting up the parameters
            status = "failed";
            msg = "Note Not Updated Successfully"

            // return res.status(401).json({ status: status, msg: msg, error : "Access Denied !"})
            return res.status(404).json({ status: status, msg: msg, error: "Access Denied !" });

        }

        // If code is reached here, that's means the note is belong to the user which is logged in and also that note exists
        const updatedNote = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        // Setting up the parameters
        status = "success";
        msg = "Note Updated Successfully"
        return res.json({ status: status, msg: msg, updatedNote });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Note Not Updated Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
}

exports.deleteNote = async (req, res) => {

    // Making a Variable to track the success or not
    let status = "";
    let msg = "";

    try {// Finding whether the same user who created note is deleting or not

        // Finding the note from the database, whether the note exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const note = await Notes.findById(req.params.id);

        // If that note doesn't exists, then returning the Bad Response
        if (!note) {

            // Setting up the parameters
            status = "failed";
            msg = "Note Not Deleted Successfully"

            return res.status(404).json({ status: status, msg: msg, error: "Note Not Found !" })
            // return res.status(404).json("Note Not Found !");
        }

        // If note exists in database, then getting its user
        // and then comparing that with the user which has been logged in (From where we get this ?)
        // We will get the id of user which is logged in from the middle ware or from the fetchUser function
        // TODO : Add user and middleware
        if (note.user.toString() !== req.user.id) {
            // the note don't belong to that user and should not have any right ot update
            // 401 - Unauthorized

            // Setting up the parameters
            status = "failed";
            msg = "Note Not Deleted Successfully"

            return res.status(401).json({ status: status, msg: msg, error: "Access Denied !" })
            // return res.status(404).json("Access Denied !");

        }

        // If code is reached here, that's means the note is belong to the user which is logged in and also that note exists
        const deletedNote = await Notes.findByIdAndDelete(req.params.id);

        // Setting up the parameters
        status = "success";
        msg = "Note has been Deleted Successfully"

        return res.json({ status: status, msg: msg, note: deletedNote });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Note Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
}