// Creating the Controller for the Authentication Routes

// Importing dotenv for accessing the Environment Variables
const dotenv = require('dotenv');

// Importing the express-validator
const { validationResult } = require('express-validator');

// Importing jsonwebtoken
const jwt = require("jsonwebtoken");

// Importing the User schema from User Mongoose Model
const Users = require("../Models/User");

// Importing the bcrypt package to encrypt the password
const bcrypt = require("bcrypt");


// Defining Models
const Categories = require('../Models/Category');
const Income = require('../Models/Income');
const Expense = require('../Models/Expense');
const Accounts = require('../Models/Accounts');
const User = require('../Models/User');

// Loads .env file contents into process.env by default
// dotenv.config(); ----> This will not work if Both Backend and Frontend are in same folder
// Because, it will search for the .env file outside the folder i.e, root (Here, inotebook)
// So, to specify from where to load the .env file, we will define the path in the config
dotenv.config({ path: "../Backend/.env" });
// The default path is "/.env"

// This should be hidden and not be disclosed
// Putting it in .env.local
const JWT_SECRET = process.env.JWT_SECRET_KEY;


// =============================================================================================
// --------------------------------- >> ALL ROUTE FUNCTIONS << ---------------------------------
// =============================================================================================

// #region createUser
// Exporting Function to handle Creating New User
exports.createUser = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "";

    console.log("Hello !!");

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Sign Up Failed"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {
        // Here we are saving password in hash form :

        // generating salt :
        const salt = await bcrypt.genSalt(10);

        // Generating a secure password & using await as it will return a promise and we have to wait until we get the results
        const securePass = await bcrypt.hash(req.body.password, salt);

        // Getting the Data of the user
        let userData = await Users.create({
            username: req.body.username,
            email: req.body.email,
            password: securePass,
            gender: req.body.gender,
            role: req.body.role ?? "Customer",
            phone: req.body.phone
        })

        // As we have got the userData, we will only save id of the user in the form of JSON
        // and then it will be passed to the jwt and get signed!
        const userID_Data = {
            user: {
                id: userData._id,
                role: userData.role,
            }
        }

        // Signing the json web token
        const authToken = jwt.sign(userID_Data, JWT_SECRET);

        // Setting up the parameters
        status = "success";
        msg = "Sign Up Successfully"

        return res.json({ authToken, status: status, msg: msg, userData: userData });

    } catch (error) {

        // Setting up the parameters
        status = "Failed";
        msg = "Sign Up failed"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "User with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: errorMsg, description: errorMsg, status, msg: msg + " as " + errorMsg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !", status, msg: msg })
    }

}

// #region loginUser
// Exporting Function to handle the Login of the User
exports.loginUser = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "";

    console.log("Here, you will have to login here !")

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Login Failed"

        // sending the errors that are present
        return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
    }

    // Getting the Email and password :
    const { email, password } = req.body;

    // If no errors are present
    try {

        let userWithEmail;
        userWithEmail = await Users.findOne({ email, isDeleted: false });

        // If no record found in the database
        if (!userWithEmail) {

            // Setting up the parameters
            status = "failed";
            msg = "Account Doesn't Exists"

            console.log("No Email Found !");
            return res.status(404).json({ status: status, msg: msg, error: "Please try to login with correct credentials !" })
        }

        console.log("Record Found !")
        // console.log(userWithEmail)

        // If the code is here that means, user with the given email exists
        // and now we have to compare the passwords to give user a login
        const comparePassword = await bcrypt.compare(password, userWithEmail.password)
        // console.log(comparePassword);

        // if password doesn't matches
        if (!comparePassword) {

            // Setting up the parameters
            status = "failed";
            msg = "Incorrect Password"

            console.log("No Password Found !");
            return res.status(404).json({ status: status, msg: msg, error: "Please try to login with correct credentials !" })
        }

        else {
            // if password is also same, then returning the authtoken
            const userID_Data = {
                user: {
                    id: userWithEmail.id,
                    role: userWithEmail.role,
                }
            }

            // Signing the json web token
            const authToken = jwt.sign(userID_Data, JWT_SECRET);

            // Setting up the parameters
            status = "success";
            msg = "Login Successful"
            return res.json({ status: status, msg: msg, authToken })
        }

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Login Failed"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }

};

// #region getUser
// Exporting Function to get the User Details
exports.getUser = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "";

    // To Start the code, first of all we have to check whether the user is logged in or not
    // After it is logged in, we will pass the authToken in the header and from the token we will get the id
    // If we write code here, then every time when we used the authentication, we have to paste code everytime
    // So, to make it easier we will use the middleware and that can be used anywhere

    try {

        // Getting the Id and Role of the user to find out from the database
        let userId = req.user.id;
        let userRole = req.user.role;

        console.log("Your Role : ", userRole);

        // Getting the User details from the id
        // To get all the data of the user from the id, we use the select() function 
        // If we don't want any field, we can write "-fieldname".
        // For not getting password, select("-password")
        let user;

        // Getting the user type or role :
        // Fetching the records from the ID that we got from the fetchUser Function ( MiddleWare )
        user = await Users.findById(userId).select("-password");

        // Setting up the parameters
        status = "success";
        msg = "User Fetch Successful"
        return res.json({ status: status, msg: msg, user });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        // Setting up the parameters
        status = "failed";
        msg = "User Fetch Failed"
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }

}

// #region getAllUsers
// Exporting Function to get all the users in the Website Application
exports.getAllUsers = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "All Users are NOT Fetched Successfully";

    try {
        if (req.user.role.toLowerCase() === "admin") {

            // Getting the User details from the id
            // To get all the data of the user from the id, we use the select() function 
            // If we don't want any field, we can write "-fieldname".
            // For not getting password, select("-password")

            // Getting the user type or role :
            // Fetching the records from the ID that we got from the fetchUser Function ( MiddleWare )
            const allUsers = await Users.find({ isDeleted: false }).select("-password");
            const allUserCategory = await Promise.all(allUsers.map(async (user) => {
                return await Categories.find({ isDeleted: false, categoryByUser: user._id });
            }));
            const allUserIncomeTransactions = await Promise.all(allUsers.map(async (user) => {
                return await Income.find({ isDeleted: false, incomeByUser: user._id });
            }));
            const allUserExpenseTransactions = await Promise.all(allUsers.map(async (user) => {
                return await Expense.find({ isDeleted: false, expenseByUser: user._id });
            }));
            const allUserAccounts = await Promise.all(allUsers.map(async (user) => {
                return await Accounts.find({ isDeleted: false, accountByUser: user._id });
            }));


            // Setting up the parameters
            status = "success";
            msg = "All Users Fetch Successful"
            return res.json({ status: status, msg: msg, allUsers, allUserCategory, allUserIncomeTransactions, allUserExpenseTransactions, allUserAccounts });
        }
        else {
            // Setting up the parameters
            status = "failed";
            msg = "Unauthorized Access !"
            return res.json({ status: status, msg: msg });
        }
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        // Setting up the parameters
        status = "failed";
        msg = "User Fetch Failed"
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
}

// #region deleteUser
exports.deleteUser = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "User Not Found";

    try {

        let deletedUser = await Users.find({
            $and: [
                { isDeleted: false },
                { _id: req.params.userid }
            ]
        });

        console.log("User We Found :", deletedUser)

        // If that Item doesn't exists, then returning the Bad Response
        if (deletedUser.length == 0) {

            // Setting up the parameters
            status = "failed";
            msg = "Account Doesn't Exists";

            return res.status(404).json({ status: status, msg: msg, error: "account Not Found !" })
        }

        // #region Deleting Category
        // Getting all the Categories of the Deleted User
        const allUserCategory = await Categories.find({ isDeleted: false, categoryByUser: deletedUser[0]._id });

        // Soft Deleting them All
        allUserCategory.map(async (category) => {
            // Deleting Each Category Item
            await Categories.findByIdAndUpdate(category._id, { $set: { isDeleted: true } }, { new: true });
        })

        // #region Deleting Income Transactions
        // Getting all the Income transactions of the Deleted User
        const allUserIncomeTransactions = await Income.find({ isDeleted: false, incomeByUser: deletedUser[0]._id });

        // Soft Deleting them All
        allUserIncomeTransactions.map(async (transaction) => {
            // Deleting Each Category Item
            await Income.findByIdAndUpdate(transaction._id, { $set: { isDeleted: true } }, { new: true });
        })

        // #region Deleting Expense Transactions
        // Getting all the Expenses Transactions of the Deleted User
        const allUserExpenseTransactions = await Expense.find({ isDeleted: false, expenseByUser: deletedUser[0]._id });

        // Soft Deleting them All
        allUserExpenseTransactions.map(async (transaction) => {
            // Deleting Each Category Item
            await Expense.findByIdAndUpdate(transaction._id, { $set: { isDeleted: true } }, { new: true });
        })

        // #region Deleting Accounts
        // Getting all the Accounts that are created by the Deleted user
        const allUserAccounts = await Accounts.find({ isDeleted: false, accountByUser: deletedUser[0]._id });

        // Soft Deleting them All
        allUserAccounts.map(async (account) => {
            // Deleting Each Category Item
            await Accounts.findByIdAndUpdate(account._id, { $set: { isDeleted: true } }, { new: true });
        })

        // #region Deleting User
        const deletedUserData = await Users.findByIdAndUpdate(deletedUser[0]._id, { $set: { isDeleted: true } }, { new: true });

        // Setting up the parameters
        status = "success";
        msg = "User and its Data Deleted Successfully"

        return res.json({ status: status, msg: msg, deletedUserData });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Account Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }

}

// #region updateUser
exports.updateUser = async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "User Record Not Updated Successfully";

    try {
        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "User Record Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no errors are present or found
        const { username, email, gender, phone } = req.body;

        // Create a newUser Object with the new Updated Data 
        const newUser = {
            username,
            email,
            gender,
            phone
        }

        // Finding the user from the database, whether the user exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const user = await User.find({
            $and: [
                { _id: req.params.userid },
                { isDeleted: false },
            ]
        });

        // If that user doesn't exists, then returning the Bad Response
        if (!user) {

            // Setting up the parameters
            status = "failed";
            msg = "User Record Not Updated Successfully"

            return res.status(404).json({ status: status, msg: msg, error: "User Record Not Found !" });
        }

        // If code is reached here, that's means the user is belong to the user which is logged in and also that user exists
        const updatedUser = await User.findByIdAndUpdate(req.params.userid, { $set: newUser }, { new: true });
        // Setting up the parameters
        status = "success";
        msg = "User Record Updated Successfully"
        return res.json({ status: status, msg: msg, updatedUser });
    }
    catch (error) {

        // Setting up the parameters
        status = "failed";
        msg = "User Record Not Updated Successfully"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "User with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: errorMsg, description: errorMsg, status, msg: msg + " as " + errorMsg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !", status, msg: msg })
    }
};