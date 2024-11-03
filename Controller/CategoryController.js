// Creating the Controller for the Accounts Routes

// Importing the express-validator
const { validationResult } = require('express-validator');

// Importing the Income schema from Income Mongoose Model
const Categories = require("../Models/Category");

// =============================================================================================
// --------------------------------- >> ALL ROUTE FUNCTIONS << ---------------------------------
// =============================================================================================

// #region Add Category
// Exporting Function to add the Category for the Particular User in the Database
exports.addCategory = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "Category NOT Added Successfully !";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Category Addition Failed"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {

        // Setting the Data of the Category
        let categoryData = await Categories.create({
            categoryByUser: req.user.id,
            categoryName: req.body.categoryName,
            categoryType: req.body.categoryType,
            isDeleted: false
        });

        // Setting up the parameters
        status = "success";
        msg = "Category Added Successfully"

        return res.json({ status: status, msg: msg, data: categoryData });

    } catch (error) {

        // Setting up the parameters
        status = "failed";
        msg = "Category Addition failed"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "Category with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: "Internal Server Error !", description: errorMsg, status, msg: msg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !" + error.message, status, msg: msg })
    }

};

// #region Fetch Category
// Exporting Function to Fetch all the Categories of One Particular User
exports.fetchUserCategories = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Categories Found !";

    try {

        // Finding all the Categories
        let allCategoriesItems;

        if (req.user.role.toLowerCase() === "admin") {
            allCategoriesItems = await Categories.find({ $and: [{ isDeleted: false }] });
        }
        else {
            allCategoriesItems = await Categories.find({ $and: [{ categoryByUser: req.user.id }, { isDeleted: false }] });
        }

        if (allCategoriesItems.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Categories has been Fetched Successfully";

            // Finding all the CategoriesItem 
            console.log(allCategoriesItems)
        }

        return res.json({ status: status, msg: msg, categories: allCategoriesItems, categoriesCount: allCategoriesItems.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region Fetch All Categories
// Exporting Function to Fetch All the Categories in the Database
exports.fetchAllCategories = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Categories Found !";

    try {

        console.log(req.user.id);

        // Finding all the Categories
        const allCategoriesItems = await Categories.find({ isDeleted: false });

        if (allCategoriesItems.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Categories has been Fetched Successfully";

            // Finding all the CategoriesItems 
            console.log(allCategoriesItems)
        }

        return res.json({ status: status, msg: msg, categories: allCategoriesItems, categoriesCount: allCategoriesItems.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region Fetch Category By ID
// Exporting Function to Fetch the Category By its ID From the Database 
exports.fetchCategoryByID = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Category Found with this ID !";

    try {

        console.log(req.user.id);

        let categoryItem;

        // Finding Category in Database
        if (req.user.role == "Admin") {
            categoryItem = await Categories.find({ isDeleted: false, _id: req.params.categoryid });
        }
        else {
            categoryItem = await Categories.find({ isDeleted: false, _id: req.params.categoryid, categoryByUser: req.user.id });
        }

        if (categoryItem.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "Category has been Fetched Successfully";

            // Finding CategoryItem 
            console.log(categoryItem)
        }

        return res.json({ status: status, msg: msg, categories: categoryItem, categoriesCount: categoryItem.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region Delete Category By ID
// Exporting Function to Delete the Category By its ID From the Database 
exports.deleteCategoryByID = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "Category Not Found";

    try {

        // Finding the item from the database, whether the item exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        let categoryItem;

        // Finding Category in Database
        if (req.user.role == "Admin") {
            categoryItem = await Categories.find({ isDeleted: false, _id: req.params.categoryid });
        }
        else {
            categoryItem = await Categories.find({ isDeleted: false, _id: req.params.categoryid, categoryByUser: req.user.id });
        }

        console.log(categoryItem)

        // If that Item doesn't exists, then returning the Bad Response
        if (categoryItem.length == 0) {

            // Setting up the parameters
            status = "failed";
            msg = "Category Doesn't Exists";

            return res.status(404).json({ status: status, msg: msg, error: "Category Not Found !" })
        }

        // Making the Soft Delete i.e, Making the isDeleted as true
        let deletedCategory = await Categories.findByIdAndUpdate(categoryItem[0]._id, { $set: { isDeleted: true } }, { new: true });

        // Setting up the parameters
        status = "success";
        msg = "Category has been Deleted Successfully"

        return res.json({ status: status, msg: msg, category: deletedCategory });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Category Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region Update Category By ID
// Exporting Function to Update the Category By its ID From the Database 
exports.updateCategoryByID = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "Category NOT Updated Successfully !";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Category Updation Failed"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {

        const oldCategoryData = await Categories.find({
            $and: [
                { isDeleted: false },
                { _id: req.params.categoryid }
            ]
        });

        console.log(">> Category : ", oldCategoryData);

        // If that admin doesn't exists, then returning the Bad Response
        if (oldCategoryData.length == 0) {

            // Setting up the parameters
            status = "failed";
            msg = "Category Record Not Found"

            return res.status(404).json({ status: status, msg: msg, error: "Category Record Not Found !" });
        }

        // Setting the Data of the Category
        let updatedCategoryData = {
            categoryByUser: req.user.id,
            categoryName: req.body.categoryName ?? oldCategoryData[0].categoryName,
            categoryType: oldCategoryData[0].categoryType,
            isDeleted: oldCategoryData[0].isDeleted,
            creationDate: oldCategoryData[0].creationDate,
            updationDate: new Date()
        };

        let updatedCategory = await Categories.findByIdAndUpdate(oldCategoryData[0]._id, { $set: updatedCategoryData }, { new: true });

        console.log(">> Category Updated : ", updatedCategory);

        // Setting up the parameters
        status = "success";
        msg = "Category Updated Successfully"

        return res.json({ status: status, msg: msg, data: updatedCategory });

    } catch (error) {

        // Setting up the parameters
        status = "failed";
        msg = "Category Updation failed"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "Category with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: "Internal Server Error !", description: errorMsg, status, msg: msg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !" + error.message, status, msg: msg })
    }

};

// #region Get One Category Names by Category ID
exports.getOneCategoryName = async (categoryId, userId) => {
    // Query to get the category name from the IncomeCategory collection
    // Implement this based on your database schema and ORM/library you are using

    categoryItem = await Categories.find({ isDeleted: false, _id: categoryId, categoryByUser: userId });

    if (categoryItem.length != 0) {
        return categoryItem[0].categoryName
    }
    else {
        return "Unknown"
    }
}

// #region Get All Category Names of User
exports.getCategoryName = async (req, res) => {
    // Query to get the category name from the IncomeCategory collection
    // Implement this based on your database schema and ORM/library you are using

    categoryItems = await Categories.find({ isDeleted: false, categoryByUser: req.user.id }, { categoryName: 1, _id: 1, categoryType: 1 });
    console.log("-->", categoryItems);

    if (categoryItems.length != 0) {
        return res.status(200).json({ status: "success", msg: "All Category Names Fetched", categories: categoryItems })
    }
    else {
        return res.status(200).json({ status: "failed", msg: "No Category Created Yet !", categories: categoryItems })
    }
}

