const userService = require("../services/user.service")
const { REFRESH_TOKEN } = require("../constants")
const user = {
	authenticate,
	getAllUser,
	refreshToken
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

	res.cookie(REFRESH_TOKEN, refreshToken, cookiesOptions)
}

function getAllUser(req, res) {
	userService.getAllUser().then((users) => {
		res.json({users})
	})
}

function refreshToken(req, res) {
	const token = req.cookies[REFRESH_TOKEN];
	const ipAddress = req.ip;
	userService.refreshToken({token, ipAddress}).then((response) => {
		setTokenCookie(res, response.refreshToken);
		res.json(response);
	}).catch((error) => {
		res.status(403).json({
			error
		})
	})

}
