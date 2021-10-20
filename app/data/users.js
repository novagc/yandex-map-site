const 
	fs = require('fs'),
	filePath = './data/users.tb';

var obj = {
	list: {},
};

function Update() {
	fs.readFile(filePath, (err, data) => {
		if (!err) {
			obj.list = {};
			data
				.toString()
				.split('\n')
				.filter(x => x.length != 0)
				.map(x => x.trim().split(':'))
				.forEach(x => obj.list[x[0]] = x[1]);
		}
	});
}

if(!fs.existsSync(filePath)) {
	fs.writeFileSync('');		
}

Update();
setInterval(Update, 5000);

module.exports = obj;