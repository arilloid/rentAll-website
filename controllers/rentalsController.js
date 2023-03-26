const express = require("express");
const router = express.Router();
const rentalList = require("../models/rentals-db");

router.get("/", (req, res) => {
    res.render("rentals/rentals", {
        rentalsGrouped: rentalList.getRentalsByCityAndProvince(),
        title: "Rentals Page"
    });
})

module.exports = router;