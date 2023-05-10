const rentalModel = require("../models/rentalModel");
const userModel = require("../models/userModel");
const express = require("express");
const bcryptjs = require("bcryptjs");
const router = express.Router();

router.get("/", (req, res) => {
    rentalModel.find({ featuredRental: true })
    .then(data => {
        let rentals = data.map(value => value.toObject());
        res.render("general/home", {
            rentals: rentals,
            title: "Home Page"
        });
    })
    .catch((err) => {
        console.log(`Error retrieving featured rentals ... ${err}`);
    });
})
router.get("/welcome", (req, res) => {
    res.render("general/welcome", {
        title: "Welcome Page"
    });
})
// *****************************
// (GET) Route to a sign-up page
router.get("/sign-up", (req, res) => {
    res.render("general/sign-up", {
        title: "Sign-up Page"
    });
})
// (POST) Route to a sign-up page
router.post("/sign-up", (req, res) => {
    console.log(req.body);
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
        .then(users => {
            if (users.length > 0) {
                // email already exists in the database
                passedValidation = false;
                validationMessages.email = "This email is already associated with the existing account. Please enter another one."; 
            }
            // If validation is passed, saving user to the database and redirecting to welcome page
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
                            subject: "RentAll - Registration confirmation",
                            html: `Hello, ${firstName} ${lastName}<br>
                                    <br>
                                    Welcome to RentAll Website!<br>
                                    <br>
                                    All the best,<br>
                                    RentAll Team`
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
// (GET) Route to a log-in page
router.get("/log-in", (req, res) => {
    res.render("general/log-in", {
        title: "Log-in Page"
    });
})
// (POST) Route to a log-in page
router.post("/log-in", (req, res) => {
    console.log(req.body)
    const { email, password, role } = req.body;
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
    // Searching MongoDB for a document with matching email address
    userModel.findOne({ email : email })
        .then(user => {
            if(user){
                // Comparing the password supplied by the user with the one in our document
                bcryptjs.compare(req.body.password, user.password)
                .then(isMatched => {
                    if(isMatched) {
                        req.session.user = user;
                        req.session.isClerk = (role === "clerk");
                        req.session.isCustomer = (role === "customer");
                    }
                    else {
                        console.log("Passwords do not match");
                        passedValidation = false;
                        validationMessages.auth = "You have entered an invalid password."
                    }
                    // Reloading if validation is not passed
                    if(passedValidation) {
                        if(req.session.isClerk){
                            res.redirect(302, "/rentals/list");
                        }
                        else if(req.session.isCustomer){
                            res.redirect(302, "/cart");
                        }
                    }
                    else {
                        res.render("general/log-in", {
                            title: "Log-in Page",
                            validationMessages,
                            values: req.body
                        });
                    }
                })
                .catch((err) => {
                    console.log(`Error occurred while searching for the user ... ${err}`);
                });
            }
            else {
                // User was not found
                console.log("User not found in the database.");
                passedValidation = false;
                validationMessages.auth = "We couldn't find an account associated with the given email address."; 
                res.render("general/log-in", {
                    title: "Log-in Page",
                    validationMessages,
                    values: req.body
                });
            }
        })
        .catch((err) => {
            console.log(`Error occurred while searching for the user ... ${err}`);
        });
})

router.get("/cart", (req, res) => {
    if(req.session && req.session.user && req.session.isCustomer){
        res.render("general/cart", prepareViewModel(req));
    }
    else {
        console.log("Access to cart page denied!");
        res.status(401).redirect(302, "/");
    }
});

const prepareViewModel = function (req) {
    if (req.session && req.session.user && req.session.isCustomer) {
        // The user is signed in and has a session established.
        let cart = req.session.cart || [];
        // Used to store how much is owed.
        let cartTotal = 0;
        let VAT = 0;
        let grandTotal = 0;
        // Check if the cart has any songs.
        const hasRentals = cart.length > 0;
        // If there are songs in the cart, then calculate the order total.
        if (hasRentals) {
            cart.forEach(cartRental => {
                cartTotal += cartRental.rental.pricePerNight * cartRental.numOfNights;
            });
            VAT = cartTotal * 0.1;
            grandTotal = cartTotal + VAT;
        }
        return {
            hasRentals,
            rentals: cart,
            cartTotal: "$" + cartTotal.toFixed(2),
            VAT: "$" + VAT.toFixed(2),
            grandTotal: "$" + grandTotal.toFixed(2)
        };
    }
};

router.get("/reserve/:id", (req, res) => {
    if (req.session && req.session.user && req.session.isCustomer) {
        let cart = req.session.cart = req.session.cart || [];
        rentalModel.findOne({
            _id: req.params.id
        })
        .then(rental => {
            rental.toObject();
            let found = false;
            cart.forEach(cartRental => {
                if (cartRental.rental._id == rental._id) {
                    found = true;
                }
            });
            if (!found) {
                cart.push({
                    numOfNights: 1,
                    rental
                });
            }
            else {
                console.log("already added to cart");
            }
            res.redirect(302, "/cart");
        })
        .catch(err => {
            console.log(`Error finding the rental in the database ... ${err}`);
        });
    }
    else {
        console.log("Access to route denied!");
        res.status(401).redirect(302, "/");
    }
});

router.get("/remove-rental/:id", (req, res) => {
    if (req.session && req.session.user && req.session.isCustomer) {
        // The user is signed in.
        let cart = req.session.cart || [];
        // Find the index of the song in the shopping cart.
        const index = cart.findIndex(cartRental => cartRental.rental._id == req.params.id);
        if (index >= 0) {
            cart.splice(index, 1);
        }
        else {
            console.log(`Error finding the rental in the cart`);
        }
        res.redirect(302, "/cart");
    }
    else {
        console.log("Access to route denied!");
        res.status(401).redirect(302, "/");
    }
});

router.post("/update-rental/:id", (req, res) => {
    if (req.session && req.session.user && req.session.isCustomer) {
        // The user is signed in.
        let cart = req.session.cart || [];
        const rentalId = req.params.id;
        const numOfNights = parseInt(req.body.numOfNights);
        const index = cart.findIndex(cartRental => cartRental.rental._id == rentalId);
        if (index >= 0) {
            cart[index].numOfNights = numOfNights;
        }
        else {
            console.log(`Error finding the rental in the cart`);
        }
        res.redirect(302, "/cart");
    }
    else {
        console.log("Access to route denied!");
        res.status(401).redirect(302, "/");
    }
});

// Route to checkout the user.
router.get("/check-out", (req, res) => {
    // Check if the user is signed in.
    if (req.session.user && req.session.user && req.session.isCustomer) {
        // The user is already signed in.
        const email = req.session.user.email;
        let cart = req.session.cart || [];
        if (cart.length > 0) {
            const sgMail = require("@sendgrid/mail");
            sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
            const msg = {
                to: email,
                from: "arinak1017@gmail.com",
                subject: "RentAll - Order Processing.",
                html: `Hello,<br>
                        <br>
                        We are currently processing your order!<br>
                        We'll contact you about the order status in 1-2 business days.<br>
                        <br>
                        All the best,<br>
                        RentAll Team`
            }
            sgMail.send(msg)
                .then(() => {
                    req.session.cart = [];
                    console.log("Order confirmation email sent!");
                    res.redirect(302, "/cart");
                })
                .catch(err => {
                    console.log(err);
                    res.redirect(302, "/cart");
                });
        }
        else {
            console.log("The cart is empty!");
        }
    }
    else {
        console.log("Access to route denied!");
        res.status(401).redirect(302, "/");
    }
});

router.get("/logout", (req, res) => {
    // Clearing the session from memory.
    req.session.destroy();
    res.redirect(302, "/log-in");
});

module.exports = router;