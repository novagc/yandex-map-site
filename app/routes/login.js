const
	{ Router, } = require('express'),
	passport = require('passport'),
	router = Router();

router.get('/login', (req, res) => {
	res.render('login');
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login#123',
}));

module.exports = router;