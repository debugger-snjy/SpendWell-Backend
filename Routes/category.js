// This file is used for Category Operations [CRUD]

// Importing the express Package
const express = require('express');

// Importing the express-validator
const { body } = require('express-validator');

// Importing the Middleware File :
const fetchUser = require("../Middleware/FetchUser")

// Create a router of the express
const router = express.Router()

// Importing the Controller
const categoryController = require("../Controller/CategoryController");

// Creating the New Income :
// Method : POST
// Full Route : /api/category/add
router.post('/add', fetchUser, [

    body("categoryName", "Your Category Name is Empty").notEmpty(),
    body("categoryType", "Your Category Type is Empty").notEmpty(),

    body("categoryName", "Category Name can only have Minimum 2 Characters and Maximum 50 Characters").isLength({ min: 2, max: 50 }),

], categoryController.addCategory);

// Fetching all the Categories of the Particular User
// Method : GET
// Full Route : /api/category/fetch
router.get('/fetch', fetchUser, categoryController.fetchUserCategories);

// Fetching all the Categories
// Method : GET
// Full Route : /api/category/fetch/all
router.get('/fetch/all', fetchUser, categoryController.fetchAllCategories );

// Fetching Particular Category Using CategoryID
// Method : GET
// Full Route : /api/category/fetch/:categoryid
router.get('/fetch/:categoryid', fetchUser, categoryController.fetchCategoryByID);

// Deleting Particular Category Using CategoryID
// Method : GET
// Full Route : /api/category/delete/:categoryid
router.delete('/delete/:categoryid', fetchUser, categoryController.deleteCategoryByID)

// Updating the Category using the Category ID
// Method : POST
router.put('/update/:categoryid', fetchUser, [

    body("categoryName", "Your Category Name is Empty").notEmpty(),

    body("categoryName", "Category Name can only have 50 Characters at Max").isLength({ min: 2, max: 50 }),

], categoryController.updateCategoryByID);

// Get the Category Names of the user by userid
// Method : GET
router.get('/fetch/category/names',fetchUser,categoryController.getCategoryName);
module.exports = router;