const 
	fs = require('fs'),
	filePath = `${__dirname}/data/points.json`;

var points;

function Save() {
	fs.writeFile(filePath, JSON.stringify(points), () => {});
}

function Add(point) {
	points.push(point);
	Save();
}

function Update(point) {
	let index = points.findIndex(x => x.id === point.id);

	if (index !== -1) {
		points[index] = point;
		Save();
	}
}

function Delete(point) {
	let index = points.findIndex(x => x.id === point.id);

	if (index !== -1) {
		points.splice(index, 1);
		Save();
	}
}

function ToString() {
	return JSON.stringify({ points: points, });
}

if(!fs.existsSync(filePath)) {
	points = [];
	Save();
} else {
	points = require('./points.json');
}

module.exports = { Add, Update, Delete, ToString, Save }