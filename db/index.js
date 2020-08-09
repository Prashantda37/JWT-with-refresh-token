const mongoose = require("mongoose");
const connectionOptions = {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false};

mongoose.connect(process.env.MONGO_URI, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
	User: require('../model/user.model'),
	RefreshToken: require('../model/refreshToken.model'),
	isValidId
};

function isValidId(id) {
	return mongoose.Types.ObjectId.isValid(id);
}