// This file is used for account Operations [CRUD]

// Importing the express Package
const express = require('express');

// Importing the express-validator
const { body, validationResult } = require('express-validator');

// Importing the Middleware File :
const fetchUser = require("../Middleware/FetchUser")

// Importing the Accounts schema from Accounts Mongoose Model
const Accounts = require("../Models/Accounts");

// Create a router of the express
const router = express.Router()

// Importing the Account Controller
const accountController = require("../Controller/AccountController");

// Creating the New Account :
// Method : POST
// Full Route : /api/account/add
router.post('/add', fetchUser, [

    body("accountName", "Your Account Name is Empty").notEmpty(),
    body("accountType", "Your Account Type is Empty").notEmpty(),

    body("accountName", "Account Name can only have 50 Characters at Max").isLength({ min: 2, max: 50 }),

], accountController.addAccount);

// Fetching all the Accounts of the Particular User
// Method : GET
// Full Route : /api/account/fetch
router.get('/fetch', fetchUser, accountController.fetchUserAccounts);

// Fetching Accounts Balance Sumup of the Particular User
// Method : GET
// Full Route : /api/account/fetch
router.get('/fetch/stats', fetchUser, accountController.fetchAccountSumup);

// Fetching all the Accounts
// Method : GET
// Full Route : /api/account/fetch/all
router.get('/fetch/all', fetchUser, accountController.fetchAllAccounts);

// Fetching Particular account Using accountID
// Method : GET
// Full Route : /api/account/fetch/:accountid
router.get('/fetch/:accountid', fetchUser, accountController.fetchAccountByID);

// Deleting Particular account Using accountID
// Method : GET
// Full Route : /api/account/delete/:accountid
router.delete('/delete/:accountid', fetchUser, accountController.deleteAccount)

// Updating the account using the account ID
// Method : POST
// Full Route : /api/account/update/:accountid
router.put('/update/:accountid', fetchUser, [

    body("accountName", "Your Account Name is Empty").notEmpty(),
    // body("accountType", "Your Account Type is Empty").notEmpty(),

    body("accountName", "Account Name can only have 50 Characters at Max").isLength({ min: 2, max: 50 }),

], accountController.updateAccount);

// Fetch all the transaction Records
// Method : GET
// Full Route : /api/account/fetch/alltransactions
router.get('/fetch/transactions/all',fetchUser,accountController.fetchAllTransactionOfUser)
module.exports = router;

// Fetch all the Account Names of the User
// Method : GET
// Full Route : /api/account/fetch/all/:type
router.get('/fetch/all/:type',fetchUser,accountController.getAccountName);