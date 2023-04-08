var rentals = [
    {
        headline: "Spacious Condo Near the City Centre",
        numSleeps: 4,
        numBedrooms: 2,
        numBathrooms: 1,
        pricePerNight: 500,
        city: "Toronto",
        province: "Ontario",
        imageUrl: "/property-images/property-1.jpg",
        featuredRental: true
    },
    {
        headline: "Log Cabin in the Woods, Perfect for Winter Holidays",
        numSleeps: 6,
        numBedrooms: 3,
        numBathrooms: 2,
        pricePerNight: 600,
        city: "Toronto",
        province: "Ontario",
        imageUrl: "/property-images/property-2.jpg",
        featuredRental: true
    },
    {
        headline: "Luxurious Getaway Apartment",
        numSleeps: 2,
        numBedrooms: 1,
        numBathrooms: 1,
        pricePerNight: 400,
        city: "Toronto",
        province: "Ontario",
        imageUrl: "/property-images/property-3.jpg",
        featuredRental: true
    },
    {
        headline: "Stylish 2-Story Loft Apartment",
        numSleeps: 3,
        numBedrooms: 2,
        numBathrooms: 1,
        pricePerNight: 555,
        city: "Toronto",
        province: "Ontario",
        imageUrl: "/property-images/property-4.jpg",
        featuredRental: false
    },
    {
        headline: "Beautiful Manor, Close to the Nature",
        numSleeps: 5,
        numBedrooms: 3,
        numBathrooms: 1,
        pricePerNight: 700,
        city: "Montreal",
        province: "Quebec",
        imageUrl: "/property-images/property-5.jpg",
        featuredRental: false
    },
    {
        headline: "Luxurious Spacious Villa in the Suburbs",
        numSleeps: 10,
        numBedrooms: 6,
        numBathrooms: 3,
        pricePerNight: 1200,
        city: "Montreal",
        province: "Quebec",
        imageUrl: "/property-images/property-6.jpg",
        featuredRental: false
    }
];

module.exports.getFeaturedRentals = function() {
    let featuredRentals = rentals.filter(r => r.featuredRental === true);
    return featuredRentals;
};

module.exports.getRentalsByCityAndProvince = function() {
    // grouping the rentals by city and province
    const groupArrayObject = rentals.reduce((group, item) => {
        const key = item.city + ', ' + item.province;
        group[key] = group[key] ?? [];
        group[key].push(item);
        return group;
    }, {});
    // creating a new array of objects with the help of the grouped data
    const names = Object.keys(groupArrayObject);
    const values = Object.values(groupArrayObject);
    const rentalsByCityAndProvince = [];
    for (let i = 0; i < names.length; i++) {
        let item = {cityProvince: names[i], rentals: values[i]};
        rentalsByCityAndProvince.push(item);
    }
    return rentalsByCityAndProvince;
};

module.exports.getAllRentals = function() {
    return rentals;
}
