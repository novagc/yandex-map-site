const DataController = require('./dataController'); 

let points = new DataController(`${__dirname}/points.json`, 'points');
let marks = new DataController(`${__dirname}/marks.json`, 'marks');
let params = new DataController(`${__dirname}/params.json`, 'params');

points.UpdateCoords = function(coords) {
    points.data.forEach(x => {
        if(coords[x.id]) { 
            x.coords = coords[x.id].coords;
            x.address = coords[x.id].address;
        }
    });
    points.Save();
}

marks.AddNewType = function(markId, type) {
    let mark = dc.data.find(x => x.id == markId);
    
    if (mark) {
        mark.types.push(type);
        dc.Save();
    }
}

module.exports = {
    points,
    marks, 
    params,
}