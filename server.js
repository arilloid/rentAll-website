const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const fileUpload = require('express-fileupload');

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

// Setting up express-upload
app.use(fileUpload());

// Setting up express-session
const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_CONN_STRING,
    collection: 'mySessions'
  });

app.use(session({
    secret : process.env.SESSION_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
      },
      store: sessionStore,
      resave: true,
      saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.isClerk = req.session.isClerk;
    res.locals.isCustomer = req.session.isCustomer;
    next();
});

// Loading the controllers into express.
const generalController = require("./controllers/generalController");
const rentalsController = require("./controllers/rentalsController");
const loadDataController = require("./controllers/loadDataController");

app.use("/", generalController);
app.use("/rentals", rentalsController);
app.use("/load-data/rentals", loadDataController);

// Handling 404 requests to pages that are not found.
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

