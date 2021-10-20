const 
    DataRouter = require('./dataRouter'),
    marksController = require('../data/marks'),
    marksRouter = new DataRouter(marksController);

module.exports = marksRouter.router;