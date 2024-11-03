// This file is used for Authentication Purpose when user login in the app

// Importing the express Package
const express = require('express');

// Importing the express-validator
const { body } = require('express-validator');

// Importing dotenv for accessing the Environment Variables
const dotenv = require('dotenv');

// Importing the Middleware File :
const fetchUser = require("../Middleware/FetchUser")

// Create a router of the express
const router = express.Router()

// Loads .env file contents into process.env by default
// dotenv.config(); ----> This will not work if Both Backend and Frontend are in same folder
// Because, it will search for the .env file outside the folder i.e, root (Here, inotebook)
// So, to specify from where to load the .env file, we will define the path in the config
dotenv.config({ path: "../Backend/.env" });
// The default path is "/.env"

// Importing the Controller
const authController = require("../Controller/AuthController")

// Route 1 : Creating user with POST Request. No Login Required 
// Also, we have to change the get request to post request
// We will add the validations after the endpoint in the post method
// Here, no login required
router.post('/createuser', [
    body("username", "Your User  Name is Empty").notEmpty(),
    body("email", "Your Email is Empty").notEmpty(),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Your Password is Empty").notEmpty(),
    body("password", "Enter a valid Password, Password Length should be Minimum 5 Characters and Maximum 20 Characters").isLength({ min: 5, max: 20 }),
    body("phone", "Your Phone is Empty").notEmpty(),
    body("phone", "Your Phone is Empty").isNumeric(),
    body("gender", "Your Gender is Empty").notEmpty(),


], authController.createUser);

// Route 2 : Authenticate a user using POST Request. No Login Required 
// We are using POST as we are dealing with the passwords
router.post('/login', [
    // exists() ==> Used to check that the field shoul not be undefined
    body("email", "Email is Empty").exists(),
    body("password", "Password is Empty").exists(),

    body("email", "Enter a valid Email").isEmail(),
    body("password", "Enter a valid Password").isLength({ min: 5, max: 20 })
], authController.loginUser);

// Route 3 : Get Details of Loggedin User using POST Request. Login Required 
// For that one, thing is neccessary that the user should be logined in
// For that, we need the AuthToken to verfiy
// Adding the middleware
router.post('/getuser', fetchUser, authController.getUser);

// Route 4 : Get All the Users that are exists in the Application
router.get("/fetch/users/all", fetchUser, authController.getAllUsers);

// Route 5 : Deleting the User
// Deleting Particular user Using userID
// Method : GET
// Full Route : /api/auth/delete/:userid
router.delete('/delete/user/:userid', fetchUser, authController.deleteUser)
module.exports = router

// Route 6 : Editing the User
// For Updating User - PUT Request
// Full Route : /api/user/update/:id
router.put('/update/user/:userid', [

    // Checking whether the field is available or not !!
    // body("username", "Your Username is Required").exists(),
    // body("email", "Your Email is Required").exists(),
    // body("gender", "Your Gender is Required").exists(),
    // body("phone", "Your Phone is Required").exists(),

    // Checking other paramaters
    // body("phone", "Phone Number should of 10 digits").isLength({ min: 10, max: 10 }),
    // body("email", "Email ID is Invalid").isEmail(),

], fetchUser, authController.updateUser)
