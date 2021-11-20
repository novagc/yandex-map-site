const 
    check = require('../auth/check'),
    DataRouter = require('./dataRouter'),
    pointsController = require('../data/points');
    pointsRouter = new DataRouter(pointsController);

pointsRouter.router.post('/points/update/coords', check, (req, res) => {
    pointsController.UpdateCoords(req.body);
    res.sendStatus(200);
});

module.exports = pointsRouter.router;