const
	{ Router, } = require('express'),
	check = require('../auth/check'),
	marks = require('../data/marks'),
	imgs = require('../data/imgs'),
	router = Router();

router.get('/edit', check, (req, res) => {
	res.render('edit', { marks: marks.data, imgs: imgs.names });
});

module.exports = router;