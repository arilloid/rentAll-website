/*************************************************************************************
* WEB322 - 2231 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Arina Kolodeznikova
* Student ID    : 145924213
* Course/Section: WEB322 NCC
**************************************************************************************/

const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const session = require("express-session")

// Setting up dotenv
const dotenv = require("dotenv");
dotenv.config({path: "./config/keys.env"})

const app = express();

// Making the "assets: folder public
app.use(express.static(path.join(__dirname, "/assets")));

// Configuring handlebars
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
    }
}))

app.set("view engine", ".hbs");

// Setting up body-parser
app.use(express.urlencoded({extended: true}))

// Setting up express-session
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.isClerk = req.session.isClerk;
    next();
});

// Loading the controllers into express.
const generalController = require("./controllers/generalController");
const rentalsController = require("./controllers/rentalsController");

app.use("/", generalController);
app.use("/rentals", rentalsController);

// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// Connecting to the MongoDB
mongoose.connect(process.env.MONGO_CONN_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to the MongoDB database.");
    // Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
    // because sometimes port 80 is in use by other applications on the machine
    app.listen(HTTP_PORT, onHttpStart);
}).catch(() => {
    console.log(`Unable to connect to MongoDB ... ${err}`);
});

