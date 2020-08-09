const db = require("../db");
const jwt = require("jsonwebtoken")

module.exports = authorize;

function authorize(roles=[]) {
	// roles param can be a single role string (e.g. Role.User or 'User')
	// or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])

	return [
		// validate authorization token
		(req, res, next) => {
			const token = req.headers && req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
					if (!token) return res.sendStatus(401)
					jwt.verify(token, process.env.ACCESS_TOKEN, (error, user) => {
						if (error) return res.status(403).json({
							message:"The token is expired!"
						})

						req.user = user
						next()
					})
		},
		// authorize based on user role
		async (req, res, next) => {
			const user = await db.User.findById(req.user.id);
			if (!user || (roles.length && !roles.includes(user.role))) {
				// user no longer exists or role not authorized
				return res.status(401).json({message: 'Unauthorized'});
			}

			// authentication and authorization successful
			req.user.role = user.role;
			const refreshTokens = await db.RefreshToken.find({user: user.id});
			req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
			next();
		}
	]
}