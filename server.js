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
const rentalList = require("./models/rentals-db");

const app = express();

// Configuring handlebars
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main"
}))
app.set("view engine", ".hbs");

// Setting up body-parser
app.use(express.urlencoded({extended: false}))

// Making the "assets: folder public
app.use(express.static(path.join(__dirname, "/assets")));

// Add your routes here
// e.g. app.get() { ... }
app.get("/", (req, res) => {
    res.render("home", {
        rentals: rentalList.getFeaturedRentals(),
        title: "Home Page"
    });
})
app.get("/rentals", (req, res) => {
    res.render("rentals", {
        rentalsGrouped: rentalList.getRentalsByCityAndProvince(),
        title: "Rentals Page"
    });
})
app.get("/sign-up", (req, res) => {
    res.render("sign-up", {
        title: "Sign-up Page"
    });
})
app.post("/sign-up", (req, res) => {
    console.log(req.body)
    const { firstName, lastName, email, password } = req.body;
    // Validating the input
    let passedValidation = true;
    let validationMessages = {};
    // email regEX taken from: https://www.w3resource.com/javascript/form/email-validation.php
    let emailRegEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{"':;?/>.<,])(?=.*[a-zA-Z]).{8,12}$/;
    if (typeof firstName !== "string" || firstName.trim().length === 0) {
        passedValidation = false;
        validationMessages.firstName = "Please enter your first name"; 
    }
    if (typeof lastName !== "string" || lastName.trim().length === 0) {
        passedValidation = false;
        validationMessages.lastName = "Please enter your last name"; 
    }
    if (typeof email !== "string" || email.trim().length === 0) {
        passedValidation = false;
        validationMessages.email = "Please enter your email"; 
    }
    else if (!emailRegEx.test(email)) {
        passedValidation = false;
        validationMessages.email = "You should enter a valid email address"; 
    }
    if (typeof password !== "string" || password.trim().length === 0) {
        passedValidation = false;
        validationMessages.password = "Please enter your password"; 
    }
    else if (!passwordRegEx.test(password)) {
        passedValidation = false;
        validationMessages.password = "Your password should be 8-12 characters long and contain at least one lowercase letter, uppercase letter, number and a symbol"; 
    }
    // If validation is passed, redirect to the Welcome Page / overwise reload
    if(passedValidation) {
        res.redirect(302, "/welcome");
    }
    else {
        res.render("sign-up", {
            title: "Sign-up Page",
            validationMessages,
            values: req.body
        });
    }
})
app.get("/welcome", (req, res) => {
    res.render("welcome", {
        title: "Welcome Page"
    });
})
app.get("/log-in", (req, res) => {
    res.render("log-in", {
        title: "Log-in Page"
    });
})
app.post("/log-in", (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    // Validating the input
    let passedValidation = true;
    let validationMessages = {};
    if (typeof email !== "string" || email.trim().length === 0) {
        passedValidation = false;
        validationMessages.email = "Please enter your email"; 
    }
    if (typeof password !== "string" || password.trim().length === 0) {
        passedValidation = false;
        validationMessages.password = "Please enter your password"; 
    }
    // Reloading if validation is not passed
    if(passedValidation) {
        res.send("Success!");
    }
    else {
        res.render("log-in", {
            title: "Log-in Page",
            validationMessages,
            values: req.body
        });
    }
})

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
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);