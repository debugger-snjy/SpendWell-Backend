const mongoose = require('mongoose');

// Defining the Schema for the Income
const IncomeSchema = new mongoose.Schema({

    incomeByUser : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    incomeDateTime: {
        type:Date,
        required: true
    },
    incomeAmount: {
        type : Number,
        required : true,
    },
    incomeDescription: {
        type : String,
        required : true,
    },
    // We will add a DropDown of all the Account Name Which are of type Income
    incomeAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accounts",
    },
    // We will add a DropDown of all the Category Name Which are of type Income
    incomeCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
    },
    creationDate: {
        type:Date,
        default: () => new Date(),
        required: true,
    },
    updationDate: {
        type:Date,
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
const Income = mongoose.model("Income", IncomeSchema);
module.exports = Income;