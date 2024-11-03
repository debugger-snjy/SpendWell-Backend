// Creating the Controller for the Accounts Routes

// Importing the express-validator
const { body, validationResult } = require('express-validator');

// Importing the Accounts schema from Accounts Mongoose Model
const Accounts = require("../Models/Accounts");

// Importing the Income schema from Income Mongoose Model
const Incomes = require("../Models/Income");

// Importing the Expense schema from Expense Mongoose Model
const Expenses = require("../Models/Expense");

// Importing the Controller
const categoryController = require("./CategoryController");

// =============================================================================================
// --------------------------------- >> ALL ROUTE FUNCTIONS << ---------------------------------
// =============================================================================================

// #region addAccount
// Exporting Function to Add the New Account of the User
exports.addAccount = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "Account NOT Added Successfully !";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Account Addition Failed"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {

        // Setting the Data of the account
        let accountData = await Accounts.create({
            accountByUser: req.user.id,
            accountName: req.body.accountName,
            accountType: req.body.accountType
        });

        // Setting up the parameters
        status = "success";
        msg = "Account Added Successfully"

        return res.json({ status: status, msg: msg, data: accountData });

    } catch (error) {

        // Setting up the parameters
        status = "failed";
        msg = "Account Addition failed"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "Account with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: "Internal Server Error !", description: errorMsg, status, msg: msg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !" + error.message, status, msg: msg })
    }

};

// #region fetchUserAccounts
// Exporting Function to Fetch All Accounts of One Particular User
exports.fetchUserAccounts = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Accounts Found !";

    try {

        let allAccountsItems;

        if (req.user.role.toLowerCase() == "admin") {
            // Finding all the Accounts
            allAccountsItems = await Accounts.find({ $and: [{ isDeleted: false }] });
        }
        else {
            // Finding all the Accounts
            allAccountsItems = await Accounts.find({ $and: [{ accountByUser: req.user.id }, { isDeleted: false }] });
        }

        if (allAccountsItems.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Accounts has been Fetched Successfully";

            // Finding all the AccountsItem 
            console.log(allAccountsItems)
        }

        return res.json({ status: status, msg: msg, accounts: allAccountsItems, accountCount: allAccountsItems.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region fetchAllAccounts
// Exporting Function to Fetch All the Accounts in the Database
exports.fetchAllAccounts = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Accounts Found !";

    try {

        console.log(req.user.id);

        // Finding all the Accounts
        const allAccountsItems = await Accounts.find({ isDeleted: false });

        if (allAccountsItems.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Accounts has been Fetched Successfully";

            // Finding all the AccountsItems 
            console.log(allAccountsItems)
        }

        return res.json({ status: status, msg: msg, accounts: allAccountsItems, accountCount: allAccountsItems.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region fetchAccountByID
// Exporting Function to Fetch Account Record by its ID
exports.fetchAccountByID = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No account Found with this ID !";

    try {

        console.log(req.user.id);

        let accountItem;

        // Finding account in Database
        if (req.user.role == "Admin") {
            accountItem = await Accounts.find({ isDeleted: false, _id: req.params.accountid });
        }
        else {
            accountItem = await Accounts.find({ isDeleted: false, _id: req.params.accountid, accountByUser: req.user.id });
        }

        if (accountItem.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "Account has been Fetched Successfully";

            // Finding accountItem 
            console.log(accountItem)
        }

        return res.json({ status: status, msg: msg, account: accountItem, accountCount: accountItem.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
}

// #region deleteAccount
// Exporting Function to Delete the User Account by its ID
exports.deleteAccount = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "Account Not Found";

    try {

        // Finding the item from the database, whether the item exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        let accountItem;

        // Finding account in Database
        if (req.user.role == "Admin") {
            accountItem = await Accounts.find({ isDeleted: false, _id: req.params.accountid });
        }
        else {
            accountItem = await Accounts.find({ isDeleted: false, _id: req.params.accountid, accountByUser: req.user.id });
        }

        console.log(accountItem)

        // If that Item doesn't exists, then returning the Bad Response
        if (accountItem.length == 0) {

            // Setting up the parameters
            status = "failed";
            msg = "Account Doesn't Exists";

            return res.status(404).json({ status: status, msg: msg, error: "account Not Found !" })
        }

        // Making the Soft Delete i.e, Making the isDeleted as true
        let deletedaccount = await Accounts.findByIdAndUpdate(accountItem[0]._id, { $set: { isDeleted: true } }, { new: true });

        // Setting up the parameters
        status = "success";
        msg = "Account has been Deleted Successfully"

        return res.json({ status: status, msg: msg, account: deletedaccount });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Account Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region updateAccount
// Exporting Function to Update the User Account by its ID
exports.updateAccount = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "Account NOT Updated Successfully !";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Account Updation Failed"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {

        const oldaccountData = await Accounts.find({
            $and: [
                { isDeleted: false },
                { _id: req.params.accountid }
            ]
        });

        console.log(oldaccountData);

        // If that admin doesn't exists, then returning the Bad Response
        if (oldaccountData.length == 0) {

            // Setting up the parameters
            status = "failed";
            msg = "Account Record Not Found"

            return res.status(404).json({ status: status, msg: msg, error: "account Record Not Found !" });
        }

        // Setting the Data of the account
        let updatedaccountData = {
            accountByUser: req.user.id,
            accountName: req.body.accountName ?? oldaccountData[0].accountName,
            accountType: oldaccountData[0].accountType,
            isDeleted: oldaccountData[0].isDeleted,
            creationDate: oldaccountData[0].creationDate,
            updationDate: new Date()
        };

        let updatedaccount = await Accounts.findByIdAndUpdate(oldaccountData[0]._id, { $set: updatedaccountData }, { new: true });

        console.log(updatedaccount);

        // Setting up the parameters
        status = "success";
        msg = "Account Updated Successfully"

        return res.json({ status: status, msg: msg, data: updatedaccount });

    } catch (error) {

        // Setting up the parameters
        status = "failed";
        msg = "Account Updation failed"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "Account with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: "Internal Server Error !", description: errorMsg, status, msg: msg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !" + error.message, status, msg: msg })
    }

};

// #region fetchAccountSumup
// Exporting Function to Fetch all the Account Sum up Balance
exports.fetchAccountSumup = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Accounts Found !";

    try {

        console.log(req.user.id);

        let allIncomeRecords;
        let allExpensesRecords;

        if (req.user.role.toLowerCase() === "admin") {
            // Finding all the Income of the user
            allIncomeRecords = await Incomes.find({ $and: [{ isDeleted: false }] }).sort({ "incomeDateTime": -1 });
            console.log(">> Income Records : ", allIncomeRecords);

            // Finding all the Expense of the user
            allExpensesRecords = await Expenses.find({ $and: [{ isDeleted: false }] }).sort({ "expenseDateTime": -1 });

        }
        else {
            // Finding all the Income of the user
            allIncomeRecords = await Incomes.find({ $and: [{ incomeByUser: req.user.id }, { isDeleted: false }] }).sort({ "incomeDateTime": -1 });
            console.log(">> Income Records : ", allIncomeRecords);

            // Finding all the Expense of the user
            allExpensesRecords = await Expenses.find({ $and: [{ expenseByUser: req.user.id }, { isDeleted: false }] }).sort({ "expenseDateTime": -1 });

        }


        // Todo : Saving Account Fetching Remaining

        allTransactions = [...allIncomeRecords, ...allExpensesRecords];

        if (allTransactions.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Accounts has been Fetched Successfully";

            let incomeAccountSumUp = 0;
            let expenseAccountSumUp = 0;
            let savingsAccountSumUp = 0;

            allIncomeRecords.forEach((transaction) => {
                incomeAccountSumUp += transaction.incomeAmount
            })
            allExpensesRecords.forEach((transaction) => {
                expenseAccountSumUp += transaction.expenseAmount
            })

            return res.json({ status: status, msg: msg, accountsBalance: { "income": incomeAccountSumUp, "expense": expenseAccountSumUp, "saving": savingsAccountSumUp } })
        }

        return res.json({ status: status, msg: "No Records Found !" });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
}

// #region fetchAllTransactionOfUser
// Exporting Functions to get all the Transactions of the user
exports.fetchAllTransactionOfUser = async (req, res) => {
    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Transaction Records NOT Fetched Successfuly"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {
        console.log("Check : ", req.user.id)

        let allIncomeRecords;
        let allExpensesRecords;

        if (req.user.role.toLowerCase() === "admin") {

            // Finding all the Income of the user
            allIncomeRecords = await Incomes.find({ $and: [{ isDeleted: false }] }).sort({ "incomeDateTime": -1 });
            console.log(">> Income Records : ", allIncomeRecords);

            // Finding all the Expense of the user
            allExpensesRecords = await Expenses.find({ $and: [{ isDeleted: false }] });
        }
        else {

            // Finding all the Income of the user
            allIncomeRecords = await Incomes.find({ $and: [{ incomeByUser: req.user.id }, { isDeleted: false }] }).sort({ "incomeDateTime": -1 });
            console.log(">> Income Records : ", allIncomeRecords);

            // Finding all the Expense of the user
            allExpensesRecords = await Expenses.find({ $and: [{ expenseByUser: req.user.id }, { isDeleted: false }] });

        }

        let allTransactions = [];

        // Storing all the income records
        for (const incomeRec of allIncomeRecords) {
            let transaction = {
                "id": incomeRec._id,
                "user": incomeRec.incomeByUser,
                "datetime": incomeRec.incomeDateTime,
                "amount": incomeRec.incomeAmount,
                "desc": incomeRec.incomeDescription,
                "account": incomeRec.incomeAccount,
                "category": incomeRec.incomeCategory,
                "type": "income",
            }
            allTransactions.push(transaction)
        }

        // Storing all the expense records
        for (const expenseRec of allExpensesRecords) {
            let transaction = {
                "id": expenseRec._id,
                "user": expenseRec.expenseByUser,
                "datetime": expenseRec.expenseDateTime,
                "amount": expenseRec.expenseAmount,
                "desc": expenseRec.expenseDescription,
                "account": expenseRec.expenseAccount,
                "category": expenseRec.expenseCategory,
                "type": "expense",
            }
            allTransactions.push(transaction)
        }

        // Sorting the Transactions in their datetime
        console.log("Checking", allTransactions)

        // Iterate through allTransactions array and replace IDs with names
        for (let transaction of allTransactions) {
            const accountName = await getAccountName(transaction.account, transaction.user);
            const categoryName = await categoryController.getOneCategoryName(transaction.category, transaction.user);

            // Replace IDs with names
            transaction.account = accountName;
            transaction.category = categoryName;
        }


        allTransactions.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        allTransactions.reverse();

        status = "success";
        msg = "All Transaction Records Fetched Successfully"

        // Returning the Records
        return res.json({ status: status, msg: msg, allTransactions: allTransactions });
    }
    catch (error) {
        // Setting up the parameters
        status = "failed";
        msg = "Transaction Records NOT Fetched Successfuly"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "Incomes with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: "Internal Server Error !", description: errorMsg, status, msg: msg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !", status, msg: msg })
    }
}

// #region getAccountName
// Function to get the Account Names of the user
exports.getAccountName = async (req, res) => {

    let account = req.params.type.toLowerCase() === "income" ? "Income" : "Expense";
    let accountItems = await Accounts.find({ isDeleted: false, accountByUser: req.user.id, accountType: account }, { accountName: 1, _id: 1 });

    if (accountItems.length != 0) {
        return res.status(200).json({ status: "success", msg: "All Account Names Fetched", accounts: accountItems })
    }
    else {
        return res.status(200).json({ status: "failed", msg: "No Accounts Created Yet !!", accounts: accountItems })
    }
}

// Extra Functions
// Assuming you have functions to fetch account and category names from their respective collections
async function getAccountName(accountId, userId) {
    // Query to get the account name from the IncomeAccount collection
    // Implement this based on your database schema and ORM/library you are using

    // TODO : Remove the isDeleted false for getting the account name of the deleted account
    let accountItem = await Accounts.find({ isDeleted: false, _id: accountId, accountByUser: userId });

    console.log("------------------------------------")
    console.log(accountItem, accountId, userId)

    if (accountItem.length != 0) {
        return accountItem[0].accountName
    }
    else {
        return "Unknown"
    }
}