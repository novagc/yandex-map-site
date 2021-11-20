const
	{ Router, } = require('express'),
	check = require('../auth/check');

class DataRouter {
    constructor(dataController) {
        this.dataController = dataController;
        this.router = Router();

        this.router.get(`/${this.dataController.typeName}`, check, (req, res) => this.Get(req, res));
        this.router.get(`/${this.dataController.typeName}/state`, check, (req, res) => this.State(req, res));
        this.router.post(`/${this.dataController.typeName}/add`, check, (req, res) => this.Add(req, res));
        this.router.post(`/${this.dataController.typeName}/update`, check, (req, res) => this.Update(req, res));
        this.router.post(`/${this.dataController.typeName}/delete`, check, (req, res) => this.Delete(req, res));
    }

    Get(req, res) {
        res.send(this.dataController.ToString());
    }

    State(req, res) {
        res.send({ stateId: this.dataController.stateId });   
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