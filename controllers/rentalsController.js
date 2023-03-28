const express = require("express");
const router = express.Router();
const rentalList = require("../models/rentals-db");

router.get("/", (req, res) => {
    res.render("rentals/rentals", {
        rentalsGrouped: rentalList.getRentalsByCityAndProvince(),
        title: "Rentals Page"
    });
})

router.get("/list", (req, res) => {
    if(user && isClerk){
        res.render("rentals/list", {
            title: "List Page"
        });
    }
    else {
        console.log("Access to list page denied!")
        res.redirect(302, "/");
    }
});

module.exports = router;