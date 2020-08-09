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

		refreshToken.save()

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

	//Refresh token;
	async refreshToken({token, ipAddress}) {

		const refreshToken = await this.getRefreshToken(token);
		const { user } = refreshToken;

		// replace old refresh token with a new one and save
		const newRefreshToken = this.generateRefreshToken(user, ipAddress);
		refreshToken.revoked = Date.now();
		refreshToken.revokedByIp = ipAddress;
		refreshToken.replacedByToken = newRefreshToken.token;
		await refreshToken.save();
		await newRefreshToken.save();

		// generate new jwt
		const jwtToken = this.generateJwtToken(user);

		// return basic details and tokens
		return {
			user,
			jwtToken,
			refreshToken: newRefreshToken.token
		};
	}

	async getRefreshToken(token) {
		const refreshToken = await db.RefreshToken.findOne({token}).populate("user");
		if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
		return refreshToken;
	}

	async getUserInfo(id) {
		if (!db.isValidId(id)) throw "User not found....";
		const user = await db.User.findById(id);
		if (!user) throw 'User not found';
		return user;
	}

}

module.exports = new UserService();