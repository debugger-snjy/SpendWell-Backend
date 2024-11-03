const mongoose = require('mongoose');

// Defining the Schema for the Accounts
const AccountsSchema = new mongoose.Schema({

    accountByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    accountName: {
        type: String,
        required: true
    },
    // It will be Income, Expenses or Savings
    accountType: {
        type: String,
        required: true,
    },
    accountAmount: {
        type: Number,
        required: true,
        default: 0.0,
    },
    creationDate: {
        type: Date,
        default: () => new Date(),
        required: true,
    },
    updationDate: {
        type: Date,
    },
    // For Soft Delete
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    }
});

// Exporting the model: 
// model takes a name and the schema
const Accounts = mongoose.model("Accounts", AccountsSchema);
module.exports = Accounts;