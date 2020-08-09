require("dotenv").config()
require("rootpath")();

const express = require("express");
const bodyParser = require( "body-parser" );
const cookieParser = require("cookie-parser")
const cors = require("cors");

const app = express();

// Middleware
app.use( bodyParser.urlencoded({extended:false}));
// create application/json parser
app.use(bodyParser.json());

app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// create test user in db on startup if required
const defaultUser = require('./db/default.user');
defaultUser();
//Route
app.use("/v1", require("./routers"))

const port = process.env.NODE_ENV === "production" ? (process.env.PORT || 80) : 4000;
app.listen(port, () => {
	console.log(`The server is running on PORT ${port}`);
})

