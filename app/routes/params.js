const 
    DataRouter = require('./dataRouter'),
    paramsController = require('../data/params'),
    paramsRouter = new DataRouter(paramsController);

module.exports = paramsRouter.router;