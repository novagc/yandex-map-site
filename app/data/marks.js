const DataController = require('./dataController'); 

let dc = new DataController(`${__dirname}/data/marks.json`, 'marks');

dc.AddNewType = function(markId, type) {
    let mark = dc.data.find(x => x.id == markId);
    
    if (mark) {
        mark.types.push(type);
        dc.Save();
    }
}

module.exports = dc;