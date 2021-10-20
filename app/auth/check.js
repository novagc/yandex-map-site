const users = require('../data/users');

module.exports = (req, res, next) => {
	if (req.isAuthenticated() && users.list[req.user.login]) {
		next();
	} else {
		res.redirect('/login');
	}
};
