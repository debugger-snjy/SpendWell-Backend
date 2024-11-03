// Adding the Express JS Code :
const express = require('express')

// Now, Importing the connectToMongo function from "db.js"
const connectToMongoCluster = require('./Database/Connection');

// Importing cors package :
const cors = require('cors')
const bodyParser = require('body-parser');
const path = require("path")
const fs = require("fs");

const app = express()
// Changing the port number as 3000 port is reserved for react which will make us difficult for us later
const port = 5000

// Route for Authentication
const authenticationRoute = require("./Routes/auth");

// Route for Category :
const categoryRoute = require("./Routes/category");

// Route for Account :
const accountRoute = require("./Routes/account");

// Route for Incomes :
const incomeRoute = require("./Routes/income");

// Route for Expenses :
const expenseRoute = require("./Routes/expense");

// Route for Notes :
const noteRoute = require("./Routes/notes");

// Checking for the connection
connectToMongoCluster()

// Adding Middlewares :
app.use(cors()); // Added cors package for removing the cors error
app.use(express.json())  // to view the request body data
app.use(bodyParser.raw({ type: 'application/octet-stream' }));

// Available Routes
// Basic Testing Route
app.get('/', (req, res) => {
  res.send("Testing the Route - SpendWell")
})

// Route for api Authentication
app.use('/api/auth/', authenticationRoute);

// Route for Category Authentication
app.use('/api/category/', categoryRoute);

// Route for Account Authentication
app.use('/api/account/', accountRoute);

// Route for Income Authentication
app.use('/api/income/', incomeRoute);

// Route for Expense Authentication
app.use('/api/expense/', expenseRoute);

// Route for Expense Authentication
app.use('/api/notes/', noteRoute);

// Listening to the port
app.listen(port, () => {
  console.log(`SpendWell app listening on port ${port}`)
})