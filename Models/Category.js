const mongoose = require('mongoose');

// Defining the Schema for the Category
const CategorySchema = new mongoose.Schema({

    categoryByUser : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    categoryName:{
        type:String,
        required : true
    },
    // It will be Income, Expenses or Savings
    categoryType:{
        type:String,
        required : true,
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
const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;