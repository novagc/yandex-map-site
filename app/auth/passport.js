const
	passport = require('passport'),
	localStrategy = require('passport-local').Strategy,
	users = require('../data/users');

module.exports = () => {
	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});

	passport.use(new localStrategy(
		{
			usernameField: 'login',
			passwordField: 'password',
		},
		(login, password, done) => {
			var pwd = users.list[login];

			if (!pwd) {
				return done(null, false, { message: 'User not found', });
			} else if (password !== pwd) {
				return done(null, false, { message: 'Wrong password', });
			}
			return done(null, { id: 1, login: login, });
		}
	));
};
