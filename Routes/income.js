// This file is used for Authentication Purpose when user login in the app

// Importing the express Package
const express = require('express');

// Importing the express-validator
const { body } = require('express-validator');

// Importing the Middleware File :
const fetchUser = require("../Middleware/FetchUser")

// Create a router of the express
const router = express.Router()

// Importing the Income Controller
const incomeController = require("../Controller/IncomeController");

// * Tested
// Route to add an Income :
// Method : POST
// Full Route : /api/income/add
router.post('/add', fetchUser, [

    body("incomeDateTime", "Your Income DateTime is Empty").notEmpty(),
    body("incomeAmount", "Your Income Amount is Empty").notEmpty(),
    body("incomeDescription", "Your Income Description is Empty").notEmpty(),
    body("incomeAccount", "Your Income Account is Empty").notEmpty(),
    body("incomeCategory", "Your Income Category is Empty").notEmpty(),

], incomeController.addIncomeRecord);

// * Tested 
// Route to fetch all the incomes of the particular user
// Method : GET
// Full Route : /api/income/fetch
router.get("/fetch", fetchUser, incomeController.fetchUserIncomeRecords)

// * Tested
// Fetching all the Incomes
// Method : GET
// Full Route : /api/income/fetch/all
router.get('/fetch/all', fetchUser, incomeController.fetchAllIncomeRecords);

// * Tested
// Fetching Particular Income Using IncomeID
// Method : GET
// Full Route : /api/income/fetch/:incomeId
router.get('/fetch/:incomeId', fetchUser, incomeController.fetchIncomeRecordByID);

// Fetching Income Records using CategoryID
// Method : GET
// Full Route : /api/income/fetch/category/:categoryId
router.get('/fetch/category/:categoryId', fetchUser, incomeController.fetchIncomeRecordByCategory);

// Fetching Income Records using CategoryID
// Method : GET
// Full Route : /api/income/fetch/category/:categoryId
router.get('/fetch/account/:accountId', fetchUser, incomeController.fetchIncomeRecordByAccount);

// * Tested
// Deleting Particular Income Record Using Income RecordID
// Method : GET
// Full Route : /api/income/delete/:incomeId
router.delete('/delete/:incomeId', fetchUser, incomeController.deleteIncomeRecordByID);

// Updating the Income Record using the Income Record ID
// Method : POST
router.put('/update/:incomeId', fetchUser, [

    // body("incomeDateTime", "Your Income DateTime is Empty").notEmpty(),
    // body("incomeAmount", "Your Income Amount is Empty").notEmpty(),
    // body("incomeDescription", "Your Income Description is Empty").notEmpty(),
    // body("incomeAccount", "Your Income Account is Empty").notEmpty(),
    // body("incomeCategory", "Your Income Category is Empty").notEmpty(),

], incomeController.updateIncomeRecordByID);

module.exports = router;