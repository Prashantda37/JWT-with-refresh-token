const bcrypt = require('bcryptjs');
const db = require('./index');
//const Role = require('./role'); // TODO create constants later

module.exports = defaultUser;

async function defaultUser() {
	// create test user if the db is empty
	if ((await db.User.countDocuments({})) === 0) {
		const user = new db.User({
			firstName: 'Prashant',
			lastName: 'Dahiwadkar',
			username: 'admin',
			passwordHash: bcrypt.hashSync('admin@123', 10),
			role: 1
		});
		await user.save();
	}
}