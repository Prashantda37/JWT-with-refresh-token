const userService = require("../services/user.service")

const user = {
	authenticate,
	getAllUser
}
module.exports = user;

function authenticate(req, res) {
	const {username, password} = req.body;
	const idAddress = req.ip;
	userService.authenticate({username, password, idAddress}).then((response) => {
		setTokenCookie(res, response.refreshToken)
		res.json(response);
	}).catch((error) => {
		res.status(403).json({
			error
		})
	})
}

function setTokenCookie(res, refreshToken) {
	// create http only cookie with refresh token that expires in 7 days
	const cookiesOptions = {
		httpOnly: true,
		expires: new Date(Date.now() + 7 * 60 * 60 * 1000)
	}

	res.cookie("refreshToken", refreshToken, cookiesOptions)
}

function getAllUser(req, res) {
	userService.getAllUser().then((users) => {
		res.json({users})
	})
}
