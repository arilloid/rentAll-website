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
                        res.render("load-data/load-data", {
                            title: "Load Data Page",
                            message : "Success, rentals have been added to the database!"
                        });
                    })
                    .catch(err => {
                        res.render("load-data/load-data", {
                            title: "Load Data Page",
                            message :  "Couldn't insert the documents: " + err
                        });
                    })
                }
                else {
                    // There are already documents loaded, don't duplicate them.
                    res.render("load-data/load-data", {
                        title: "Load Data Page",
                        message :  "Rentals have already been added to the database"
                    });
                }
            })
            .catch(err => {
                res.render("load-data/load-data", {
                    title: "Load Data Page",
                    message :  "Couldn't count the documents: " + err
                });
            })
    }
    else {
        // Someone else is signed in they cannot load the data.
        res.status(401).render("load-data/load-data", {
            title: "Load Data Page",
            message : "You are not authorized to add rentals"
        });
    }
})

module.exports = router;