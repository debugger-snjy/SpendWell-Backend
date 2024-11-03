// Importing the express Package
const express = require('express');

// Importing the express-validator
const { body } = require('express-validator');

// Importing the Middleware File :
const fetchUser = require("../Middleware/FetchUser")

// Create a router of the express
const router = express.Router()

// Importing the Constroller
const notesController = require("../Controller/NoteController");

// Route 1 : Fetching all the Notes of the User using GET Request "/api/notes/notes/fetchallnotes"
// Here, Login is Required ==> Middleware needed
router.get('/fetchallnotes', fetchUser, notesController.fetchallnotes)

// Route 2 : Adding Notes in the database using POST Request "/api/student/notes/addnote"
// Here, Login is Required ==> Middleware needed
router.post('/addnote', fetchUser, [
    body("title", "Title can't be Empty !").exists(),
    body("description", "Description can't be Empty !").exists(),
    body("description", "Description can't be Empty !").isLength({ min: 5 })
], notesController.addNote)

// Route 3 : Updating an existing Note in the database using PUT Request "/api/notes/notes/updatenote"
// Here, Login is Required ==> Middleware needed
// Also, the user could update his/her note only so for that we have to check for the user as well
router.put('/updatenote/:id', fetchUser, [
    body("title", "Title can't be Empty !").notEmpty(),
    body("description", "Description can't be Empty !").notEmpty(),
    body("description", "Description should have minimum of 5 Letters !").isLength({ min: 5 })
], notesController.updateNote)

// Route 4 : Deleting an existing Note in the database using DELETE Request "/api/notes/notes/deletenote"
// Here, Login is Required ==> Middleware needed
// Also, the user could delete his/her note only so for that we have to check for the user as well
router.delete('/deletenote/:id', fetchUser, notesController.deleteNote)

module.exports = router;