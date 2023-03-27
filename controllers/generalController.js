const userModel = require("../models/userModel");
const express = require("express");
const router = express.Router();
const rentalList = require("../models/rentals-db");

router.get("/", (req, res) => {
    res.render("general/home", {
        rentals: rentalList.getFeaturedRentals(),
        title: "Home Page"
    });
})
router.get("/sign-up", (req, res) => {
    res.render("general/sign-up", {
        title: "Sign-up Page"
    });
})
router.post("/sign-up", (req, res) => {
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
    // Checking the uniqueness of the entered email
    userModel.find({ email: email})
        .then((users) => {
            if (users.length > 0) {
                // email already exists in the database
                passedValidation = false;
                validationMessages.email = "This email is already associated with the existing account. Please enter another one."; 
            }
            // If validation is passed, save user to the database
            if(passedValidation) {
                const newUser = new userModel({firstName, lastName, email, password});

                newUser.save()
                    .then(userSaved => {
                        console.log(`User ${userSaved.firstName} has been added to the database.`);
                        const sgMail = require("@sendgrid/mail");
                        sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
                        const msg = {
                            to: email,
                            from: "arinak1017@gmail.com",
                            subject: "Registration confirmation",
                            html: `Hello, ${firstName} ${lastName}<br>
                                    <br>
                                    Welcome to RentAll Website!<br>
                                    <br>
                                    All the best,<br>
                                    Arina`
                        }
                        sgMail.send(msg)
                            .then(() => {
                                res.redirect(302, "/welcome");
                            })
                            .catch(err => {
                                console.log(err);
                                res.render("general/sign-up", {
                                    title: "Sign-up Page",
                                    validationMessages,
                                    values: req.body
                                });
                            });
                    })
                    .catch(err => {
                        console.log(`Error adding user to the database ... ${err}`);
                        res.render("general/sign-up", {
                            title: "Sign-up Page",
                            validationMessages,
                            values: req.body
                        });
                    });
            }
            else {
                res.render("general/sign-up", {
                    title: "Sign-up Page",
                    validationMessages,
                    values: req.body
                });
            }
        })
        .catch((err) => {
            console.log(`Error occurred while checking email existence ... ${err}`);
        });
})
router.get("/welcome", (req, res) => {
    res.render("general/welcome", {
        title: "Welcome Page"
    });
})
router.get("/log-in", (req, res) => {
    res.render("general/log-in", {
        title: "Log-in Page"
    });
})
router.post("/log-in", (req, res) => {
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
        res.render("general/log-in", {
            title: "Log-in Page",
            validationMessages,
            values: req.body
        });
    }
})

module.exports = router;