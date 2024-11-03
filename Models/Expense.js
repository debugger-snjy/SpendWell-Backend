const mongoose = require('mongoose');

// Defining the Schema for the Expense
const ExpenseSchema = new mongoose.Schema({

    expenseByUser : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    expenseDateTime: {
        type:Date,
        required: true
    },
    expenseAmount: {
        type : Number,
        required : true,
    },
    expenseDescription: {
        type : String,
        required : true,
    },
    expenseAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accounts",
    },
    expenseCategory: {
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
const Expense = mongoose.model("Expense", ExpenseSchema);
module.exports = Expense;