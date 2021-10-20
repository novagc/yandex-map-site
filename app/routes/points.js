const 
    DataRouter = require('./dataRouter'),
    pointsController = require('../data/points'),
    pointsRouter = new DataRouter(pointsController);

module.exports = pointsRouter.router;