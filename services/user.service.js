const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../db")

class UserService {

	//async method
	async authenticate({username, password, idAddress}) {
		const user = await db.User.findOne({username});

		if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
			throw "Username or password is incorrect!"
		}

		//authentication successfully so generate jwt token and refresh token
		const jwtToken = this.generateJwtToken(user);
		const refreshToken = this.generateRefreshToken(user, idAddress);

		return {
			user,
			jwtToken,
			refreshToken: refreshToken.token
		}

	}

	//To generateJWTToken
	generateJwtToken(user) {
		return jwt.sign({sub: user.id, id: user.id}, process.env.ACCESS_TOKEN, {expiresIn:"15m"})
	}

	// To generate refresh Token
	generateRefreshToken(user, ipAddress) {
		// create a refresh token that expires in 7 days
		return new db.RefreshToken({
			user: user.id,
			token: this.randomTokenString(),
			expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			createdByIp: ipAddress
		})
	}

	randomTokenString() {
		return crypto.randomBytes(40).toString('hex');
	}

	async getAllUser() {
		const users = await db.User.find()
		return users;
	}

}

module.exports = new UserService();