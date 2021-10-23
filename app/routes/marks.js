const 
    DataRouter = require('./dataRouter'),
    check = require('../auth/check'),
    marksController = require('../data/marks'),
    marksRouter = new DataRouter(marksController);

marksRouter.router.post('/marks/types/add', check, function(req, res) {
    let markId = req.body.id;
    let type = req.body.type;

    marksController.AddNewType(markId, type);
    res.sendStatus(200);
});

module.exports = marksRouter.router;