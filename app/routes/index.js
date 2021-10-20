const
	{ Router, } = require('express'),
	{ config, } = require('../config/config'),
	check = require('../auth/check'),
	router = Router();

router.get('/', check, (req, res) => {
	res.render('index', { apiKey: config.api.key, });
});

module.exports = router;