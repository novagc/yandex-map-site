const
	{ Router, } = require('express'),
	check = require('../auth/check');

class DataRouter {
    constructor(dataController) {
        this.dataController = dataController;
        this.router = Router();

        this.router.get(`/${this.dataController.typeName}`, check, this.Get);
        this.router.post(`/${this.dataController.typeName}/add`, check, this.Add);
        this.router.post(`/${this.dataController.typeName}/update`, check, this.Update);
        this.router.post(`/${this.dataController.typeName}/delete`, check, this.Delete);
    }

    Get(req, res) {
        res.send(this.dataController.ToString());
    }

    Add(req, res) {
        this.dataController.Add(req.body);
        res.sendStatus(200);
    }

    Update(req, res) {
        this.dataController.Update(req.body);
        res.sendStatus(200);
    }

    Delete(req, res) {
        this.dataController.Delete(req.body);
        res.sendStatus(200);
    }
}

module.exports = DataRouter;