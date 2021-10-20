const
	{ Router, } = require('express'),
	check = require('../auth/check'),
	points = require('../data/points'),
	router = Router();

router.get('/points', check, (req, res) => {
	res.send(points.ToString());
});

router.post('/points/add', check, (req, res) => {
	points.Add(req.body);
	res.sendStatus(200);
});

router.post('/points/update', check, (req, res) => {
	points.Update(req.body);
	res.sendStatus(200);
});

router.post('/points/delete', check, (req, res) => {
	points.Delete(req.body);
	res.sendStatus(200);
});

module.exports = router;