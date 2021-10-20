const { DataController } = require('./dataController'); 

module.exports = new DataController(`${__dirname}/data/points.json`, 'points');