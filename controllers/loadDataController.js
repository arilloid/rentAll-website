const rentalModel = require("../models/rentalModel");
const express = require("express");
const router = express.Router();
const rentalList = require("../models/rentals-db");

router.get("/", (req, res) => {
    if(req.session && req.session.user && req.session.isClerk){
        rentalModel.count()
            .then(count => {
                if (count === 0) {
                    // There are no documents, proceed with the data load.
                    rentalModel.insertMany(rentalList.getAllRentals())
                    .then(() => {
                        res.success("Success, data was loaded!");
                    })
                    .catch(() => {
                        res.send("Couldn't insert the documents: " + err);
                    })
                }
                else {
                    // There are already documents loaded, don't duplicate them.
                }
            })
            .catch(err => {
                res.send("Couldn't count the documents: " + err);
            })
    }
    else {
        // Someone else is signed in they cannot load the data.
        res.status(401).send("You are not authorized");
    }
})

module.exports = router;