const rentalModel = require("../models/rentalModel");
const express = require("express");
const router = express.Router();
//const rentalList = require("../models/rentals-db");
const path = require("path");
const fs = require("fs")

router.get("/", (req, res) => {
    rentalModel.find()
    .then(data => {
        let rentals = data.map(value => value.toObject());
        // Grouping the retrieved values by city and province
        const groupArrayObject = rentals.reduce((group, item) => {
            const key = item.city + ', ' + item.province;
            group[key] = group[key] ?? [];
            group[key].push(item);
            return group;
        }, {});
        // Creating a new array of objects with the help of the grouped data
        const names = Object.keys(groupArrayObject);
        const values = Object.values(groupArrayObject);
        const rentalsByCityAndProvince = [];
        for (let i = 0; i < names.length; i++) {
            let item = {cityProvince: names[i], rentals: values[i]};
            rentalsByCityAndProvince.push(item);
        }
        res.render("rentals/rentals", {
            rentalsGrouped: rentalsByCityAndProvince,
            title: "Rentals Page"
        });
    })
    .catch((err) => {
        console.log(`Error retrieving rentals ... ${err}`);
    });
})

router.get("/list", (req, res) => {
    if(req.session && req.session.user && req.session.isClerk){
        rentalModel.find().sort({
            headline : 1
        })
        .then(data =>{
            let rentals = data.map(value => value.toObject());
            res.render("rentals/list", {
                title: "List Page",
                rentals : rentals
            });
        })
        .catch(err => {
            console.log("Error has occurred while retrieving the data..." + err);
        })
    }
    else {
        console.log("Access to list page denied!")
        res.status(401).redirect(303, "/");
    }
});

router.get("/add", (req, res) => {
    if(req.session && req.session.user && req.session.isClerk){
        res.render("rentals/add-rental", {
            title: "Add Page",
            action: "Add"
        });
    }
    else {
        console.log("Access to add page denied!")
        res.status(401).redirect(303, "/");
    }
});

router.post("/add", (req, res) => {
    if(req.session && req.session.user && req.session.isClerk){
        console.log(req.body);
        // Validating the input
        let passedValidation = true;
        let picRegEx = /\.(jpg|jpeg|gif|png)$/;
        // Checking the file extension
        if(!picRegEx.test(req.files.imageUrl.name)){
            let validationMessage = "! Invalid file type. Please select a file with a jpg, jpeg, gif, or png extension."
            res.render("rentals/add-rental", {
                title: "Add Page",
                action: "Add",
                validationMessage,
                values: req.body
            });
        }
        else {
            const rental = new rentalModel({
                headline: req.body.headline,
                numSleeps: req.body.numSleeps,
                numBedrooms: req.body.numBedrooms,
                numBathrooms: req.body.numBathrooms,
                pricePerNight: req.body.pricePerNight,
                city: req.body.city,
                province: req.body.province,
                featuredRental: req.body.featuredRental === "on"
            });
            rental.save()
            .then((rentalSaved) => {
                // Rental has been added correctly
                console.log(`Rental ${rentalSaved.headline} has been added to the database.`);
                // Creating a unique name for the image, so it can be saved in the file system
                let uniqueName = `/property-images/property-${rentalSaved._id}${path.parse(req.files.imageUrl.name).ext}`;
                // Copying the image data to a file
                req.files.imageUrl.mv(`assets/images${uniqueName}`)
                .then(() => {
                    // Updating the user document
                    rentalModel.updateOne({ 
                        _id: rentalSaved._id
                    }, {
                        imageUrl: uniqueName
                    }).then(() => {
                        // Success
                        console.log("The image successfully saved to the mongoDB");
                        res.redirect(302, "/rentals/list");
                    })
                    .catch(err => {
                        console.log(`Error updating the property image ... ${err}`);
                        res.redirect(302, "/rentals/list");
                    });
                })
                .catch(err => {
                    console.log(`Error saving the property image ... ${err}`);
                    res.redirect(302, "/rentals/list");
                });
            })
            .catch((err) => {
                console.log(`Error adding rentals to the database ... ${err}`);
                res.redirect(302, "/rentals/list");
            })
        }
    }
    else {
        console.log("Access denied!")
        res.status(401).redirect(303, "/");
    }
});

router.get("/edit/:id", (req, res) => {
    if(req.session && req.session.user && req.session.isClerk){
        rentalModel.findOne({
            _id: req.params.id
        })
        .then(rental => {
            rental.toObject();
            res.render("rentals/edit-rental", {
                title: "Edit Page",
                action: "Edit",
                values: rental
            });
        })
        .catch(err => {
            console.log(`Error finding the rental in the database ... ${err}`);
            res.redirect(302, "/rentals/list");
        })
    }
    else {
        console.log("Access to edit page denied!")
        res.status(401).redirect(302, "/");
    }
});

router.post("/edit/:id", (req, res) => {
    if(req.session && req.session.user && req.session.isClerk){
        rentalModel.findOne({ _id: req.params.id }).then((rental) => {
            rental.headline = req.body.headline;
            rental.numSleeps = req.body.numSleeps;
            rental.numBedrooms = req.body.numBedrooms;
            rental.numBathrooms = req.body.numBathrooms;
            rental.pricePerNight = req.body.pricePerNight;
            rental.city = req.body.city;
            rental.province = req.body.province;
            rental.featuredRental = req.body.featuredRental === "on";
        
            if (req.files && req.files.imageUrl) {
                // Validating the input
                let passedValidation = true;
                let picRegEx = /\.(jpg|jpeg|gif|png)$/;
                // Checking the file extension
                if(!picRegEx.test(req.files.imageUrl.name)){
                    let validationMessage = "! Invalid file type. Please select a file with a jpg, jpeg, gif, or png extension."
                    rental.toObject();
                    res.render("rentals/edit-rental", {
                        title: "Edit Page",
                        action: "Edit",
                        validationMessage,
                        values: rental
                    });
                }
              else {
                  // Deleting the old file from the system
                  fs.unlink(`assets/images${rental.imageUrl}`, (err) => {
                      if (err) {
                      console.log(`Error deleting file ... ${err}`);
                      } else {
                      console.log("Delete File successfully.");
                      }
                  });
                  // Creating a unique name for the new image, so it can be saved in the file system
                  let uniqueName = `/property-images/property-${req.params.id}${path.parse(req.files.imageUrl.name).ext}`;
                  req.files.imageUrl.mv(`assets/images${uniqueName}`, (err) => {
                      if (err) {
                          console.log(`Error saving the rental image ... ${err}`);
                          res.redirect(302, "/rentals/list");
                      } else {
                          rental.imageUrl = uniqueName;
                          rental.save().then(() => {
                              // Success
                              console.log("The rental record was successfully updated");
                              res.redirect(302, "/rentals/list");
                          }).catch((err) => {
                              console.log(`Error updating the rental record ... ${err}`);
                              res.redirect(302, "/rentals/list");
                          });
                      }
                  });
              }
            } else {
              rental.save().then(() => {
                // Success
                console.log("The rental record was successfully updated");
                res.redirect(302, "/rentals/list");
              }).catch((err) => {
                console.log(`Error updating the rental record ... ${err}`);
                res.redirect(302, "/rentals/list");
              });
            }
        });
    }
    else {
        console.log("Access denied!")
        res.status(401).redirect(303, "/");
    }
  });

router.get("/remove/:id", (req, res) => {
    if(req.session && req.session.user && req.session.isClerk){
        rentalModel.findOne({
            _id: req.params.id
        })
        .then(rental => {
            rental.toObject();
            res.render("rentals/remove-rental", {
                title: "Remove Page",
                action: "Remove",
                values: rental
            });
        })
        .catch(err => {
            console.log(`Error finding the rental in the database ... ${err}`);
            res.redirect(302, "/rentals/list");
        })
    }
    else {
        console.log("Access to remove page denied!")
        res.status(401).redirect(303, "/");
    }
});

router.post("/remove/:id", (req, res) => {
    if(req.session && req.session.user && req.session.isClerk){
        rentalModel.findOne({
            _id: req.params.id
        })
        .then(rental => {
            // Deleting image file (locally)
            if (rental.imageUrl) {
                fs.unlink(`assets/images${rental.imageUrl}`, (err) => {
                    if (err) { 
                        console.log(`Error deleting file ... ${err}`);
                    } else {
                        console.log("Delete File successfully.");
                    }
                });
            }
            // Deleting rental document from database
            rentalModel.deleteOne({
                _id: req.params.id
            })
            .then(() => {
                console.log("The rental was successfully removed");
                res.redirect(302, "/rentals/list");
            })
            .catch(err => {
                console.log(`Error deleting the rental document ... ${err}`);
                res.redirect(302, "/rentals/list");
            });
        })
        .catch(err => {
            console.log(`Error finding the rental in the database ... ${err}`);
            res.redirect(302, "/rentals/list");
        })
    }
    else {
        console.log("Access to remove page denied!")
        res.status(401).redirect(303, "/");
    }
});

module.exports = router;