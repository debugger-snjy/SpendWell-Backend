// Creating the Controller for the Expenses Routes

// Importing the express-validator
const { validationResult } = require('express-validator');

// Importing the Expenses schema from Expenses Mongoose Model
const Expenses = require("../Models/Expense");

// Importing the Account schema from Account Mongoose Model
const Accounts = require("../Models/Accounts");

// =============================================================================================
// --------------------------------- >> ALL ROUTE FUNCTIONS << ---------------------------------
// =============================================================================================

// #region addExpenseRecord
// Exporting Function to Add New Expense Record of the User in the Database
exports.addExpenseRecord = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Expenses Record NOT Added Successfully"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {

        // Finding the Account

        // Finding the Expense Account :
        // let expenseAccount = await Accounts.find({ $and: [{ accountByUser: req.user.id }, { _id: req.body.expenseAccount }, { isDeleted: false }, { accountType: "Expense" }] });
        // console.log("Expenses Account :", expenseAccount);

        // Finding the Income Account
        let expenseAccount = await Accounts.find({ $and: [{ accountByUser: req.user.id }, { _id: req.body.expenseAccount }, { isDeleted: false }] });
        console.log("Income Account :", expenseAccount);

        if (expenseAccount.length > 0) {

            // Getting the Data of the user
            let expenseRecord = await Expenses.create({
                expenseByUser: req.user.id,
                expenseDateTime: req.body.expenseDateTime,
                expenseAmount: req.body.expenseAmount,
                expenseDescription: req.body.expenseDescription,
                expenseAccount: req.body.expenseAccount,
                expenseCategory: req.body.expenseCategory,
            })

            // Removing or Deducting the Expense Amount From the Income Account
            let expenseAccountUpdated = await Accounts.findByIdAndUpdate(expenseAccount[0]._id, { $set: { accountAmount: ((expenseAccount[0].accountAmount + expenseRecord.expenseAmount)), updationDate: new Date() } }, { new: true });
            console.log("Expense : : : ", expenseAccountUpdated);

            // Adding the Amount In the New Account
            // let expenseAccountUpdated = await Accounts.findByIdAndUpdate(incomeAccount[0]._id, { $set: { accountAmount: ((incomeAccount[0].accountAmount - expenseRecord.expenseAmount)), updationDate: new Date() } }, { new: true });

            if (expenseAccountUpdated) {
                status = "success";
                msg = "Expenses Added Successfully & Account Updated Successfully !!"
            }
            else {
                status = "failed";
                msg = "Expenses Added Successfully BUT Accounts NOT Updated Successfully !!"
            }

            return res.json({ status: status, msg: msg, expenseRecord: expenseRecord });
        }
        else {
            status = "failed";
            msg = "Your Income Or Expenses Accounts Not Found";

            return res.json({ status: status, msg: msg });
        }

    } catch (error) {

        // Setting up the parameters
        status = "failed";
        msg = "Expenses Record NOT Added Successfully"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "Expenses with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: "Internal Server Error !", description: errorMsg, status, msg: msg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !", status, msg: msg })
    }

};

// #region fetchUserExpensesRecord
// Exporting Function to Fetch Expense Records of One Particular user
exports.fetchUserExpensesRecord = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Expensess Records NOT Fetched"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {
        // Finding all the Expenses
        const allExpensesRecords = await Expenses.find({ $and: [{ expenseByUser: req.user.id }, { isDeleted: false }] });

        if (allExpensesRecords.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Expenses has been Fetched Successfully";

            // Finding all the ExpensesItem 
            console.log(allExpensesRecords)
        }

        return res.json({ status: status, msg: msg, expensesRecords: allExpensesRecords, expensesRecordsCount: allExpensesRecords.length });
    }
    catch (error) {
        // Setting up the parameters
        status = "failed";
        msg = "Expenses Records NOT Found Successfully"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "Expensess with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: "Internal Server Error !", description: errorMsg, status, msg: msg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !", status, msg: msg })
    }

};

// #region fetchAllExpensesRecord
// Exporting Function to Fetch All the Expenses Record in the Database
exports.fetchAllExpensesRecord = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Expensess Found !";

    try {

        console.log(req.user.id);

        // Finding all the Expensess
        const allExpensessRecords = await Expenses.find({ isDeleted: false });

        if (allExpensessRecords.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Expensess has been Fetched Successfully";

            // Finding all the ExpensessItems 
            console.log(allExpensessRecords)
        }

        return res.json({ status: status, msg: msg, expenses: allExpensessRecords, expensesCount: allExpensessRecords.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region fetchExpenseRecordByID
// Exporting Function to Fetch the Expense Record by its ID from the Database
exports.fetchExpenseRecordByID = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Expenses Found with this ID !";

    try {

        console.log(req.user.id);

        let expenseRecord;

        // Finding Expenses in Database
        if (req.user.role == "Admin") {
            expenseRecord = await Expenses.find({ isDeleted: false, _id: req.params.expenseId });
        }
        else {
            expenseRecord = await Expenses.find({ isDeleted: false, _id: req.params.expenseId, expenseByUser: req.user.id });
        }

        if (expenseRecord.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "Expenses has been Fetched Successfully";

            // Finding ExpensesItem 
            console.log(expenseRecord)
        }

        return res.json({ status: status, msg: msg, expenses: expenseRecord, expensesCount: expenseRecord.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region fetchExpenseRecordByCategory
// Exporting Function to Fetch the Expense Record By ID From the Database
exports.fetchExpenseRecordByCategory = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Expense Found with this Category !";

    try {

        console.log(req.user.id);
        console.log(req.params.categoryId);

        let expenseRecords;

        // Finding Expense in Database
        expenseRecords = await Expenses.find({ isDeleted: false, expenseByUser: req.user.id, expenseCategory: req.params.categoryId });

        if (expenseRecords.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "Expense has been Fetched Successfully";

            // Finding ExpenseItem 
            console.log(expenseRecords)
        }

        return res.json({ status: status, msg: msg, expenses: expenseRecords, expensesCount: expenseRecords.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region fetchExpenseRecordByAccount
// Exporting Function to Fetch the Expense Record By Account ID From the Database
exports.fetchExpenseRecordByAccount = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Expense Found with this Account !";

    try {

        console.log(req.user.id);
        console.log(req.params.accountId);

        let expenseRecords;

        // Finding Expense in Database
        expenseRecords = await Expenses.find({ isDeleted: false, expenseByUser: req.user.id, expenseAccount: req.params.accountId });

        if (expenseRecords.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "Expense has been Fetched Successfully";

            // Finding ExpenseItem 
            console.log(expenseRecords)
        }

        return res.json({ status: status, msg: msg, expenses: expenseRecords, expensesCount: expenseRecords.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};


// #region deleteExpenseRecordByID
// Exporting Function to Delete the Expense Record by its ID from the Database
exports.deleteExpenseRecordByID = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "Expenses Record Not Found";

    try {

        // Finding the Expense Record
        let expenseRecord = await Expenses.find({ $and: [{ _id: req.params.expenseId }, { isDeleted: false }] });
        if (expenseRecord.length > 0) {

            // Finding the Expense Account from the expense Record :
            let expenseAccount = await Accounts.find({ $and: [{ accountByUser: req.user.id }, { _id: expenseRecord[0].expenseAccount }, { isDeleted: false }, { accountType: "Expense" }] });
            console.log("Expenses Account :", expenseAccount);

            // // Finding the Income Account from the expense Record
            // let incomeAccount = await Accounts.find({ $and: [{ accountByUser: req.user.id }, { _id: expenseRecord[0].incomeAccount }, { isDeleted: false }, { accountType: "Income" }] });
            // console.log("Income Account :", incomeAccount);

            // if (incomeAccount.length > 0 && expenseAccount.length > 0) {
            if (expenseAccount.length > 0) {

                // Removing or Deducting the Expense Amount From the Expense Account
                // let expenseAccountUpdated = await Accounts.findByIdAndUpdate(expenseAccount[0]._id, { $set: { accountAmount: ((expenseAccount[0].accountAmount - expenseRecord[0].expenseAmount)), updationDate: new Date() } }, { new: true });
                let expenseAccountUpdated = await Accounts.findByIdAndUpdate(expenseAccount[0]._id, { $set: { accountAmount: ((expenseAccount[0].accountAmount - expenseRecord[0].expenseAmount)), updationDate: new Date() } }, { new: true });

                // Adding the Amount Back to the Income Account From which the user has used or recorded the money
                // let incomeAccountUpdated = await Accounts.findByIdAndUpdate(incomeAccount[0]._id, { $set: { accountAmount: ((incomeAccount[0].accountAmount + expenseRecord[0].expenseAmount)), updationDate: new Date() } }, { new: true });

                // Deleting the Expense Account
                // Making the Soft Delete i.e, Making the isDeleted as true
                let deletedExpenseRecord = await Expenses.findByIdAndUpdate(expenseRecord[0]._id, { $set: { isDeleted: true } }, { new: true });

                if (expenseAccountUpdated) {

                    status = "success";
                    msg = "Expenses Deleted Successfully & Account Updated Successfully !!"
                }
                else {
                    status = "failed";
                    msg = "Expenses Deleted Successfully BUT Accounts NOT Updated Successfully !!"
                }

                return res.json({ status: status, msg: msg, deletedExpenseRecord: deletedExpenseRecord });
            }
            else {
                status = "failed";
                msg = "Your Accounts Connected with this Expense Record have Not Found !";

                return res.json({ status: status, msg: msg });
            }
        }
        else {

            status = "failed";
            msg = "Your Expense Record with this id Doesn't Exists !";

            return res.json({ status: status, msg: msg });
        }
    }
    catch (error) {
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Expenses Record Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region updateExpenseRecordByID
// Exporting Function to Update the Expense Record by its ID from the Database
exports.updateExpenseRecordByID = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "Expenses Record NOT Updated Successfully !";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Expenses Record Updation Failed"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {

        // Fetching the Old Record Data
        const oldExpensesRecordData = await Expenses.find({
            $and: [
                { isDeleted: false },
                { _id: req.params.expenseId }
            ]
        });

        if (oldExpensesRecordData.length > 0) {
            // Creating the Updated Record Data : 
            const updatedExpensesRecordData = {
                expenseDateTime: req.body.expenseDateTime ?? oldExpensesRecordData.expenseDateTime,
                expenseAmount: req.body.expenseAmount ?? oldExpensesRecordData.expenseAmount,
                expenseDescription: req.body.expenseDescription ?? oldExpensesRecordData.expenseDescription,
                expenseAccount: req.body.expenseAccount ?? oldExpensesRecordData.expenseAccount,
                incomeAccount: req.body.incomeAccount ?? oldExpensesRecordData.incomeAccount,
                expenseCategory: req.body.expenseCategory ?? oldExpensesRecordData.expenseCategory,
                updationDate: new Date(),
            }

            console.log("1");

            console.log(oldExpensesRecordData);
            console.log(updatedExpensesRecordData);
            console.log("11");

            // If other things like time or description has changed, then we will only run the command and doesn't update the Accounts or Amounts
            // No change in the account and amount
            if (updatedExpensesRecordData.expenseAmount == oldExpensesRecordData[0].expenseAmount && (updatedExpensesRecordData.expenseAccount == oldExpensesRecordData[0].expenseAccount || updatedExpensesRecordData.expenseAccount == undefined) && (updatedExpensesRecordData.incomeAccount == oldExpensesRecordData[0].incomeAccount || updatedExpensesRecordData.incomeAccount == undefined)) {

                // Now Updating the Record !!
                let updatedExpensesRecord = await Expenses.findByIdAndUpdate(oldExpensesRecordData[0]._id, { $set: updatedExpensesRecordData }, { new: true });
                console.log("111");

                status = "success";
                msg = "Your Expense Record Has Updated Successfully !!";

                return res.status(200).json({ status: status, msg: msg, updatedExpensesRecord });

            }
            // If any one thing out of 3 (expenseAccount, incomeAccount, expenseAmount) has changed :
            else {

                console.log("111.1")

                let oldExpense_ExpenseAccount = await Accounts.find({
                    $and: [
                        { _id: oldExpensesRecordData[0].expenseAccount },
                        { isDeleted: false },
                    ]
                });
                console.log("oldExpense_ExpenseAccount : ", oldExpense_ExpenseAccount)
                console.log("111.2")

                // let oldExpense_IncomeAccount = await Accounts.find({
                //     $and: [
                //         { _id: oldExpensesRecordData[0].incomeAccount },
                //         { isDeleted: false },
                //     ]
                // });
                // console.log("oldExpense_IncomeAccount : ", oldExpense_IncomeAccount)
                console.log("111.3")

                let updatedExpense_ExpenseAccount = await Accounts.find({
                    $and: [
                        { _id: updatedExpensesRecordData.expenseAccount },
                        { isDeleted: false },
                    ]
                });
                console.log("updatedExpense_ExpenseAccount : ", updatedExpense_ExpenseAccount)
                console.log("111.4")

                // let updatedExpense_IncomeAccount = await Accounts.find({
                //     $and: [
                //         { _id: updatedExpensesRecordData.incomeAccount },
                //         { isDeleted: false },
                //     ]
                // });
                // console.log("updatedExpense_IncomeAccount : ", updatedExpense_IncomeAccount)
                console.log("111.5")

                // if (oldExpense_ExpenseAccount.length > 0 && oldExpense_IncomeAccount.length > 0 && updatedExpense_ExpenseAccount.length > 0 && updatedExpense_IncomeAccount.length > 0) {
                if (oldExpense_ExpenseAccount.length > 0 && updatedExpense_ExpenseAccount.length > 0) {

                    console.log("111.6")

                    // All the Accounts Exists and we can proceed !

                    // Fetching the old and new Expense Amount 
                    let oldExpenseAmount = oldExpensesRecordData[0].expenseAmount;
                    let updatedExpenseAmount = updatedExpensesRecordData.expenseAmount;

                    console.log("oldExpense_ExpenseAccount : ", oldExpense_ExpenseAccount)
                    // console.log("oldExpense_IncomeAccount : ", oldExpense_IncomeAccount)
                    console.log("updatedExpense_ExpenseAccount : ", updatedExpense_ExpenseAccount)
                    // console.log("updatedExpense_IncomeAccount : ", updatedExpense_IncomeAccount)

                    console.log("OldExpenseAmount : ", oldExpenseAmount)
                    console.log("updatedExpenseAmount : ", updatedExpenseAmount)

                    // Checking the Expense and Income Account
                    // console.log("Checking the IDs of the Expense Account : ", oldExpense_ExpenseAccount[0]._id, updatedExpense_ExpenseAccount[0]._id)
                    // console.log("Comparing the IDs of the Expense Accounts : ", (oldExpense_ExpenseAccount[0]._id === updatedExpense_ExpenseAccount[0]._id))
                    // console.log("Comparing the IDs of the Expense Accounts : ", (oldExpense_ExpenseAccount[0]._id.toString() === updatedExpense_ExpenseAccount[0]._id.toString()))

                    // Declaring the Variables for the updation made :
                    let oldExpense_SameExpenseAccountUpdated;
                    let oldExpense_ExpenseAccountUpdated;
                    let updatedExpense_ExpenseAccountUpdated;
                    // let oldExpense_SameIncomeAccountUpdated;
                    // let oldExpense_IncomeAccountUpdated;
                    // let updatedExpense_IncomeAccountUpdated;


                    // Checking & Updating if the Expense Account are Same or not !?
                    if (oldExpense_ExpenseAccount[0]._id.toString() === updatedExpense_ExpenseAccount[0]._id.toString()) {

                        // console.log("--------->> Same Expense Accounts !!")

                        // As the Expense Account are Same, then we will subtract the old Expense Amount and Add the New Expense Amount
                        oldExpense_SameExpenseAccountUpdated = await Accounts.findByIdAndUpdate(oldExpense_ExpenseAccount[0]._id, { $set: { accountAmount: ((oldExpense_ExpenseAccount[0].accountAmount - oldExpenseAmount) + updatedExpenseAmount), updationDate: new Date() } }, { new: true });
                        console.log("Updated oldExpense_SameExpenseAccountUpdated : ", oldExpense_SameExpenseAccountUpdated)

                    }
                    else {
                        // oldExpense_ExpenseAccount ====> Remove Expense Amount
                        oldExpense_ExpenseAccountUpdated = await Accounts.findByIdAndUpdate(oldExpense_ExpenseAccount[0]._id, { $set: { accountAmount: ((oldExpense_ExpenseAccount[0].accountAmount - oldExpensesRecordData[0].expenseAmount)), updationDate: new Date() } }, { new: true });
                        console.log("Updated oldExpense_ExpenseAccountUpdated : ", oldExpense_ExpenseAccountUpdated)

                        // updatedExpense_ExpenseAccount ====> Add Expense Amount
                        updatedExpense_ExpenseAccountUpdated = await Accounts.findByIdAndUpdate(updatedExpense_ExpenseAccount[0]._id, { $set: { accountAmount: ((updatedExpense_ExpenseAccount[0].accountAmount + updatedExpensesRecordData.expenseAmount)), updationDate: new Date() } }, { new: true });
                        console.log("Updated updatedExpense_ExpenseAccountUpdated : ", updatedExpense_ExpenseAccountUpdated)

                    }


                    // Checking & Updating if the Income Account are Same or not !?
                    // if (oldExpense_IncomeAccount[0]._id.toString() == updatedExpense_IncomeAccount[0]._id.toString()) {

                    //     // As the Expense Account are Same, then we will subtract the old Expense Amount and Add the New Expense Amount
                    //     oldExpense_SameIncomeAccountUpdated = await Accounts.findByIdAndUpdate(oldExpense_IncomeAccount[0]._id, { $set: { accountAmount: ((oldExpense_ExpenseAccount[0].accountAmount - oldExpenseAmount) + updatedExpenseAmount), updationDate: new Date() } }, { new: true });
                    //     console.log("Updated oldExpense_SameIncomeAccountUpdated : ", oldExpense_SameIncomeAccountUpdated)

                    // }
                    // else {
                    //     // oldExpense_IncomeAccount ====> Add Expense Amount
                    //     oldExpense_IncomeAccountUpdated = await Accounts.findByIdAndUpdate(oldExpense_IncomeAccount[0]._id, { $set: { accountAmount: ((oldExpense_IncomeAccount[0].accountAmount + oldExpensesRecordData[0].expenseAmount)), updationDate: new Date() } }, { new: true });
                    //     console.log("Updated oldExpense_IncomeAccountUpdated : ", oldExpense_IncomeAccountUpdated)

                    //     // updatedExpense_IncomeAccount ====> Remove Expense Amount
                    //     updatedExpense_IncomeAccountUpdated = await Accounts.findByIdAndUpdate(updatedExpense_IncomeAccount[0]._id, { $set: { accountAmount: ((updatedExpense_IncomeAccount[0].accountAmount - updatedExpensesRecordData.expenseAmount)), updationDate: new Date() } }, { new: true });
                    //     console.log("Updated updatedExpense_IncomeAccountUpdated : ", updatedExpense_IncomeAccountUpdated)

                    // }

                    console.log("1111.1")

                    // Now Updating the Expense Record !!
                    let updatedExpensesRecord = await Expenses.findByIdAndUpdate(oldExpensesRecordData[0]._id, { $set: updatedExpensesRecordData }, { new: true });

                    console.log("updated Expense Record : ", updatedExpensesRecord)

                    if (updatedExpensesRecord) {
                        status = "success";
                        msg = "Your Expense Record Has Updated Successfully & Accounts Has Been Also Updated !!";

                        return res.status(200).json({ status: status, msg: msg, updatedExpensesRecord });
                    }
                    else {
                        status = "failed";
                        msg = "Your Expense Record Has NOT Updated Successfully !!";

                        return res.status(400).json({ status: status, msg: msg, updatedExpensesRecord });
                    }
                }
                else {
                    status = "failed";
                    msg = "Your Expense Record Has NOT Updated Successfully as Some Accounts Doesn't Exists !!";

                    return res.status(200).json({ status: status, msg: msg, updatedExpensesRecord });
                }

            }

        }
        else {
            status = "failed";
            msg = "Expenses Record with this ExpensesID doesn't Exists !";
            return res.json({ status: status, msg: msg });
        }

    } catch (error) {

        // Setting up the parameters
        status = "failed";
        msg = "Expenses Record Updation failed"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "Expenses Record with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: "Internal Server Error !", description: errorMsg, status, msg: msg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !" + error.message, status, msg: msg })
    }

};