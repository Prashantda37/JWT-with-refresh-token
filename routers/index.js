const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const authorize = require("../middleware/authorize")


const user = require("../controllers/user.controller")

router.post("/authenticate", requestValidate, user.authenticate);
router.get("/all-user", authorize(), user.getAllUser);


module.exports = router;


// request validate Middleware
function requestValidate(req, res, next) {

	const schema = Joi.object({
		username: Joi.string().required(),
		password:Joi.string().required()
	});

	const options = {
		abortEarly: false, // include all errors
		allowUnknown: true, // ignore unknown props
		stripUnknown: true // remove unknown props
	};
	const {error} = schema.validate(req.body, options);

	if (error) {
		res.status(403).json({
			message: "Invalid username and password."
		})
	} else {
		next()
	}
}