const
	{ Router, } = require('express'),
	{ config, } = require('../config/config'),
	marks = require('../data/marks'),
	check = require('../auth/check'),
	router = Router();

router.get('/', check, (req, res) => {
	res.render('index', { apiKey: config.api.key, marks: marks.data });
});

module.exports = router;