const mongoose = require('mongoose');

// Defining the Schema for the Reports
const ReportsSchema = new mongoose.Schema({

    reportName :{
        type:String,
        required : true
    },
    // Income, Expenses, Savings or Investments !
    reportFrom :{
        type:String,
        required : true
    },
    reportDateFrom :{
        type:Date,
        required : true
    },
    reportDateTo :{
        type:Date,
        required : true
    },
    reportType :{
        type:String,
        required : true
    },
    reportByUser :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required : true
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
const Reports = mongoose.model("Reports", ReportsSchema);
module.exports = Reports;