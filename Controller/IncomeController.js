// Creating the Controller for the Income Routes

// Importing the express-validator
const { validationResult } = require('express-validator');

// Importing the Income schema from Income Mongoose Model
const Incomes = require("../Models/Income");

// Importing the Account schema from Account Mongoose Model
const Accounts = require("../Models/Accounts");

// =============================================================================================
// --------------------------------- >> ALL ROUTE FUNCTIONS << ---------------------------------
// =============================================================================================

// #region addIncomeRecord
// Exporting Function to Add Income Record in the Database
exports.addIncomeRecord = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Income Record NOT Added Successfully"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {

        // TODO : Check whether the incomeAccount and incomeCategory are present in the datbases
        // incomeAccount
        // incomeCategory

        // Getting the Data of the user
        let incomeData = await Incomes.create({
            incomeByUser: req.user.id,
            incomeDateTime: req.body.incomeDateTime,
            incomeAmount: req.body.incomeAmount,
            incomeDescription: req.body.incomeDescription,
            incomeAccount: req.body.incomeAccount,
            incomeCategory: req.body.incomeCategory,
        })

        // After Adding the Income Record, Adding the Income in the Account !
        // Finding the Account
        let accountData = await Accounts.find({ $and: [{ accountByUser: req.user.id }, { _id: incomeData.incomeAccount }, { isDeleted: false }] });
        console.log("DATA :", accountData);
        if (accountData) {

            // Updating the Account Amount
            let accountUpdated = await Accounts.findByIdAndUpdate(accountData[0]._id, { $set: { accountAmount: Number(accountData[0].accountAmount + incomeData.incomeAmount) } }, { new: true });

            if (accountUpdated) {
                console.log("Amount Updated !!");

                // Setting up the parameters
                status = "success";
                msg = "Income Record has been Added Successfully & Account Updated Successfully"
            }
            else {
                console.log("Amount Not Updated !!");

                // Setting up the parameters
                status = "success";
                msg = "Income Record has been Added Successfully BUT Account NOT Updated Successfully";
            }
        }
        else {
            console.log("Amount Not Updated !!");

            // Setting up the parameters
            status = "failed";
            msg = "Income Record NOT Added Successfully";
        }
        console.log(req.user.id, req.body.incomeAccount)

        status = "success";
        msg = "Income Record has been Added Successfully !"

        return res.json({ status: status, msg: msg, incomeData: incomeData });

    } catch (error) {

        // Setting up the parameters
        status = "failed";
        msg = "Income Record NOT Added Successfully"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "Income with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: "Internal Server Error !", description: errorMsg, status, msg: msg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !", status, msg: msg })
    }

};

// #region fetchUserIncomeRecords
// Exporting Function to Fetch Income Records of One Particular User
exports.fetchUserIncomeRecords = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Incomes Records NOT Fetched"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {
        // Finding all the Income
        const allIncomeRecords = await Incomes.find({ $and: [{ incomeByUser: req.user.id }, { isDeleted: false }] });

        // Setting up the parameters
        status = "success";
        msg = "All Income has been Fetched Successfully";

        if (allIncomeRecords.length !== 0) {
            // Finding all the IncomeItem 
            console.log(allIncomeRecords)
        }

        return res.json({ status: status, msg: msg, incomesRecords: allIncomeRecords, incomesRecordsCount: allIncomeRecords.length });
    }
    catch (error) {
        // Setting up the parameters
        status = "failed";
        msg = "Income Records NOT Found Successfully"

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

};

// #region fetchAllIncomeRecords
// Exporting Function to Fetch All Income Records in the Database
exports.fetchAllIncomeRecords = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Incomes Found !";

    try {

        console.log(req.user.id);

        // Finding all the Incomes
        const allIncomesRecords = await Incomes.find({ isDeleted: false });

        if (allIncomesRecords.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Incomes has been Fetched Successfully";

            // Finding all the IncomesItems 
            console.log(allIncomesRecords)
        }

        return res.json({ status: status, msg: msg, incomes: allIncomesRecords, incomesCount: allIncomesRecords.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region fetchIncomeRecordByID
// Exporting Function to Fetch the Income Record By ID From the Database
exports.fetchIncomeRecordByID = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Income Found with this ID !";

    try {

        console.log(req.user.id);

        let incomeRecord;

        // Finding Income in Database
        if (req.user.role == "Admin") {
            incomeRecord = await Incomes.find({ isDeleted: false, _id: req.params.incomeId });
        }
        else {
            incomeRecord = await Incomes.find({ isDeleted: false, _id: req.params.incomeId, incomeByUser: req.user.id });
        }

        if (incomeRecord.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "Income has been Fetched Successfully";

            // Finding IncomeItem 
            console.log(incomeRecord)
        }

        return res.json({ status: status, msg: msg, incomes: incomeRecord, incomesCount: incomeRecord.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region fetchIncomeRecordByCategory
// Exporting Function to Fetch the Income Record By ID From the Database
exports.fetchIncomeRecordByCategory = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Income Found with this Category !";

    try {

        console.log(req.user.id);
        console.log(req.params.categoryId);

        let incomeRecords;

        // Finding Income in Database
        incomeRecords = await Incomes.find({ isDeleted: false, incomeByUser: req.user.id, incomeCategory: req.params.categoryId });

        if (incomeRecords.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "Income has been Fetched Successfully";

            // Finding IncomeItem 
            console.log(incomeRecords)
        }

        return res.json({ status: status, msg: msg, incomes: incomeRecords, incomesCount: incomeRecords.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region fetchIncomeRecordByAccount
// Exporting Function to Fetch the Income Record By Account ID From the Database
exports.fetchIncomeRecordByAccount = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "No Income Found with this Account !";

    try {

        console.log(req.user.id);
        console.log(req.params.accountId);

        let incomeRecords;

        // Finding Income in Database
        incomeRecords = await Incomes.find({ isDeleted: false, incomeByUser: req.user.id, incomeAccount: req.params.accountId });

        if (incomeRecords.length != 0) {

            // Setting up the parameters
            status = "success";
            msg = "Income has been Fetched Successfully";

            // Finding IncomeItem 
            console.log(incomeRecords)
        }

        return res.json({ status: status, msg: msg, incomes: incomeRecords, incomesCount: incomeRecords.length });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region deleteIncomeRecordByID
// Exporting Function to Delete the Income Record By ID From the Database
exports.deleteIncomeRecordByID = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "Income Record Not Found";

    try {
        console.log("4PM Income Check 1");

        console.log(req.user.id)

        // Finding the item from the database, whether the item exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        let incomeRecord;

        // Finding Income Record in Database
        if (req.user.role == "Admin") {
            incomeRecord = await Incomes.find({ isDeleted: false, _id: req.params.incomeId });
        }
        else {
            incomeRecord = await Incomes.find({ isDeleted: false, _id: req.params.incomeId, incomeByUser: req.user.id });
        }

        console.log("Income : ", incomeRecord)

        // If that Item doesn't exists, then returning the Bad Response
        if (incomeRecord.length == 0) {

            console.log("4PM Income Check 2");

            // Setting up the parameters
            status = "failed";
            msg = "Income Record Doesn't Exists";

            return res.status(404).json({ status: status, msg: msg, error: "Income Record Not Found !" })
        }
        console.log("4PM Income Check 3");

        // Making the Soft Delete i.e, Making the isDeleted as true
        let deletedIncomeRecord = await Incomes.findByIdAndUpdate(incomeRecord[0]._id, { $set: { isDeleted: true } }, { new: true });

        console.log("Deleted : ", deletedIncomeRecord);

        // Finding the Account
        let accountData = await Accounts.find({ $and: [{ accountByUser: req.user.id }, { _id: deletedIncomeRecord.incomeAccount }, { isDeleted: false }] });
        console.log("DATA :", accountData);
        if (accountData.length > 0) {
            console.log("4PM Income Check 4");


            // Updating the Account Amount
            let accountUpdated = await Accounts.findByIdAndUpdate(accountData[0]._id, { $set: { accountAmount: Number(accountData[0].accountAmount - deletedIncomeRecord.incomeAmount) } }, { new: true });

            if (accountUpdated) {
                console.log("4PM Income Check 5");
                console.log("Amount Updated !!");

                // Setting up the parameters
                status = "success";
                msg = "Income Record has been Deleted Successfully & Account Updated Successfully"
            }
            else {
                console.log("4PM Income Check 6");
                console.log("Amount Not Updated !!");

                // Setting up the parameters
                status = "success";
                msg = "Income Record has been Deleted Successfully BUT Account NOT Updated Successfully";
            }
        }
        else {
            console.log("4PM Income Check 7");
            console.log("Amount Not Updated !!");

            // Setting up the parameters
            status = "failed";
            msg = "Income Record NOT Deleted Successfully";
        }
        console.log("4PM Income Check 8");

        return res.json({ status: status, msg: msg, incomeRecord: deletedIncomeRecord });
    }
    catch (error) {
        console.log("4PM Income Check 8");

        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Income Record Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
};

// #region updateIncomeRecordByID
// Exporting Function to Update the Income Record By ID From the Database
exports.updateIncomeRecordByID = async (req, res) => {

    // Making a Variable to track the success or failure of an API
    let status = "failed";
    let msg = "Income Record NOT Updated Successfully !";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Income Record Updation Failed"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg + " | " + errors.array()[0].msg });
    }

    try {

        // Fetching the Old Record Data
        const oldIncomeRecordData = await Incomes.find({
            $and: [
                { isDeleted: false },
                { _id: req.params.incomeId }
            ]
        });

        if (oldIncomeRecordData.length > 0) {
            // Creating the Updated Record Data : 
            const updatedIncomeData = {
                incomeDateTime: req.body.incomeDateTime ?? oldIncomeRecordData.incomeDateTime,
                incomeAmount: req.body.incomeAmount ?? oldIncomeRecordData.incomeAmount,
                incomeDescription: req.body.incomeDescription ?? oldIncomeRecordData.incomeDescription,
                incomeAccount: req.body.incomeAccount ?? oldIncomeRecordData.incomeAccount,
                incomeCategory: req.body.incomeCategory ?? oldIncomeRecordData.incomeCategory,
                updationDate: new Date(),
            }

            console.log("1");

            console.log(oldIncomeRecordData);
            console.log(updatedIncomeData);
            console.log("11");

            // Now Updating the Record !!
            let updatedIncomeRecord = await Incomes.findByIdAndUpdate(oldIncomeRecordData[0]._id, { $set: updatedIncomeData }, { new: true });
            console.log("111");

            // TODO : Case of Different Account and Category is Remaining to Edit !!
            // TODO : In That Case, we have to remove the income amount from old account and add it in the new account !!

            // If the Record is updated, Then we will update the account income if it is changed !!
            if (updatedIncomeData.incomeAccount == oldIncomeRecordData[0].incomeAccount) {
                if (updatedIncomeData.incomeAmount != oldIncomeRecordData[0].incomeAmount) {
                    console.log("1111");
                    console.log(updatedIncomeRecord)

                    // Finding the Account
                    let accountData = await Accounts.find({ $and: [{ accountByUser: updatedIncomeRecord.incomeByUser }, { _id: updatedIncomeRecord.incomeAccount }, { isDeleted: false }] });
                    console.log("DATA :", accountData);
                    if (accountData) {
                        console.log("11111");

                        // Updating the Account Amount
                        // We will deduct or reduce the Account amount by the old Income Record amount and then add the new updated income amount ! 
                        let accountUpdated = await Accounts.findByIdAndUpdate(accountData[0]._id, { $set: { accountAmount: ((accountData[0].accountAmount - oldIncomeRecordData[0].incomeAmount) + updatedIncomeRecord.incomeAmount) } }, { new: true });

                        if (accountUpdated) {
                            console.log("Amount Updated !!");

                            // Setting up the parameters
                            status = "success";
                            msg = "Income Record Updated & Account Updated Successfully"
                        }
                        else {
                            console.log("Amount Not Updated !!");

                            // Setting up the parameters
                            status = "success";
                            msg = "Income Record Updated BUT Account NOT Updated Successfully";
                        }
                    }
                    else {
                        console.log("Amount Not Updated !!");

                        // Setting up the parameters
                        status = "failed";
                        msg = "Income Record Updated BUT Account NOT Updated Successfully as Account NOT Found !";
                    }
                }
                else {
                    // Setting up the parameters
                    status = "success";
                    msg = "Income Record Updated Successfully";
                }
                return res.json({ status: status, msg: msg, data: updatedIncomeRecord });

            }
            else {

                // Finding the Old Account :
                let oldAccountData = await Accounts.find({ $and: [{ accountByUser: updatedIncomeRecord.incomeByUser }, { _id: oldIncomeRecordData[0].incomeAccount }, { isDeleted: false }] });
                console.log("Old Account DATA :", oldAccountData);

                // Finding the New Account
                let newAccountData = await Accounts.find({ $and: [{ accountByUser: updatedIncomeRecord.incomeByUser }, { _id: updatedIncomeRecord.incomeAccount }, { isDeleted: false }] });
                console.log("New Account DATA :", newAccountData);

                if (newAccountData.length > 0 && oldAccountData.length > 0) {

                    // Removing the Amount From the Old Account
                    let oldAccountUpdated = await Accounts.findByIdAndUpdate(oldAccountData[0]._id, { $set: { accountAmount: ((oldAccountData[0].accountAmount - oldIncomeRecordData[0].incomeAmount)) } }, { new: true });

                    // Adding the Amount In the New Account
                    let newAccountUpdated = await Accounts.findByIdAndUpdate(newAccountData[0]._id, { $set: { accountAmount: ((newAccountData[0].accountAmount + updatedIncomeRecord.incomeAmount)) } }, { new: true });

                    if (newAccountUpdated && oldAccountUpdated) {
                        status = "success";
                        msg = "Income Updated Successfully & Account Updated Successfully !"
                    }
                    else {
                        status = "failed";
                        msg = "Income Updated Successfully BUT Accounts NOT Updated Successfully !"
                    }
                }
                else {
                    status = "failed";
                    msg = "Income Updated Successfully BUT Accounts NOT Updated as Accounts NOT Found !"
                }
                return res.json({ status: status, msg: msg, data: updatedIncomeRecord });

            }
        }
        else {
            status = "failed";
            msg = "Income Record with this IncomeID doesn't Exists !";
            return res.json({ status: status, msg: msg });
        }

    } catch (error) {

        // Setting up the parameters
        status = "failed";
        msg = "Income Record Updation failed"

        // Checking and Showing the Message for the Duplication Errors
        var duplicatedKey, errorMsg;

        if (error.code === 11000) {
            duplicatedKey = error.keyValue; // Or error.keyValue
            console.error("Duplicate key:", duplicatedKey);

            for (const key in duplicatedKey) {
                errorMsg = "Income Record with Same " + key + " Exists !!";
            }

            return res.status(500).json({ error: "Internal Server Error !", description: errorMsg, status, msg: msg })

        }

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !" + error.message, status, msg: msg })
    }

};
