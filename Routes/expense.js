// This file is used for Authentication Purpose when user login in the app

// Importing the express Package
const express = require('express');

// Importing the express-validator
const { body } = require('express-validator');

// Importing the Middleware File :
const fetchUser = require("../Middleware/FetchUser")

// Create a router of the express
const router = express.Router()

// Importing the Controller
const expenseController = require("../Controller/ExpenseController");

// * Tested 
// Route to add an Expenses :
// Method : POST
// Full Route : /api/expense/add
router.post('/add', fetchUser, [

    body("expenseDateTime", "Your Expenses DateTime is Empty").notEmpty(),
    body("expenseAmount", "Your Expenses Amount is Empty").notEmpty(),
    body("expenseDescription", "Your Expenses Description is Empty").notEmpty(),
    body("expenseAccount", "Your Expenses Account is Empty").notEmpty(),
    // body("incomeAccount", "Your Account From Where You Expense is Empty").notEmpty(),
    body("expenseCategory", "Your Expenses Category is Empty").notEmpty(),

], expenseController.addExpenseRecord);

// * Tested 
// Route to fetch all the expenses of the particular user
// Method : GET
// Full Route : /api/expense/fetch
router.get('/fetch', fetchUser, expenseController.fetchUserExpensesRecord)

// * Tested 
// Fetching all the Expensess
// Method : GET
// Full Route : /api/expense/fetch/all
router.get('/fetch/all', fetchUser, expenseController.fetchAllExpensesRecord);

// * Tested
// Fetching Particular Expenses Using ExpensesID
// Method : GET
// Full Route : /api/expense/fetch/:expenseId
router.get('/fetch/:expenseId', fetchUser, expenseController.fetchExpenseRecordByID);

// Fetching Expense Records using CategoryID
// Method : GET
// Full Route : /api/expense/fetch/category/:categoryId
router.get('/fetch/category/:categoryId', fetchUser, expenseController.fetchExpenseRecordByCategory);

// Fetching Expense Records using CategoryID
// Method : GET
// Full Route : /api/expense/fetch/category/:categoryId
router.get('/fetch/account/:accountId', fetchUser, expenseController.fetchExpenseRecordByAccount);

// * Tested 
// Deleting Particular Expenses Record Using Expenses RecordID
// Method : GET
// Full Route : /api/expense/delete/:expenseId
router.delete('/delete/:expenseId', fetchUser, expenseController.deleteExpenseRecordByID)

// Updating the Expenses Record using the Expenses Record ID
// Method : POST
router.put('/update/:expenseId', fetchUser, [

    // body("expenseDateTime", "Your Expenses DateTime is Empty").notEmpty(),
    // body("expenseAmount", "Your Expenses Amount is Empty").notEmpty(),
    // body("expenseDescription", "Your Expenses Description is Empty").notEmpty(),
    // body("expenseAccount", "Your Expenses Account is Empty").notEmpty(),
    // body("expenseCategory", "Your Expenses Category is Empty").notEmpty(),

], expenseController.updateExpenseRecordByID);

module.exports = router;


// In Edit 
// -> User Change other things like time !
// -> User Change the Account Amount
// -> User Change the Income Account
// -> User Change the Expense Account
// -> User Change the Both Account


// // oldExpense_ExpenseAccount ====> Remove Expense Amount
// let oldExpense_ExpenseAccountUpdated = await Accounts.findByIdAndUpdate(oldExpense_ExpenseAccount[0]._id, { $set: { accountAmount: ((oldExpense_ExpenseAccount[0].accountAmount - oldExpensesRecordData[0].expenseAmount)) , updationDate : new Date()} }, { new: true });
// console.log("Updated oldExpense_ExpenseAccountUpdated : ", oldExpense_ExpenseAccountUpdated)

// // oldExpense_IncomeAccount ====> Add Expense Amount
// let oldExpense_IncomeAccountUpdated = await Accounts.findByIdAndUpdate(oldExpense_IncomeAccount[0]._id, { $set: { accountAmount: ((oldExpense_IncomeAccount[0].accountAmount + oldExpensesRecordData[0].expenseAmount)) , updationDate : new Date()} }, { new: true });
// console.log("Updated oldExpense_IncomeAccountUpdated : ", oldExpense_IncomeAccountUpdated)

// // updatedExpense_ExpenseAccount ====> Add Expense Amount
// let updatedExpense_ExpenseAccountUpdated = await Accounts.findByIdAndUpdate(updatedExpense_ExpenseAccount[0]._id, { $set: { accountAmount: ((updatedExpense_ExpenseAccount[0].accountAmount + updatedExpensesRecordData.expenseAmount)) , updationDate : new Date()} }, { new: true });
// console.log("Updated updatedExpense_ExpenseAccountUpdated : ", updatedExpense_ExpenseAccountUpdated)

// // updatedExpense_IncomeAccount ====> Remove Expense Amount
// let updatedExpense_IncomeAccountUpdated = await Accounts.findByIdAndUpdate(updatedExpense_IncomeAccount[0]._id, { $set: { accountAmount: ((updatedExpense_IncomeAccount[0].accountAmount - updatedExpensesRecordData.expenseAmount)) , updationDate : new Date()} }, { new: true });
// console.log("Updated updatedExpense_IncomeAccountUpdated : ", updatedExpense_IncomeAccountUpdated)
