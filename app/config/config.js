const
	{ readFile, } = require('fs'),
	{ resolve: pathResolve, } = require('path'),
	{ promisify, } = require('util'),
	{ watch: fileWatcher, } = require('chokidar');

const
	readFileAsync = promisify(readFile),
	files = {
		server: pathResolve(`${__dirname}/server.json`),
		api   : pathResolve(`${__dirname}/api.json`),
	},
	config = {};

async function loadConfig(config, configFiles = files) {
	for (const param in configFiles) {
		if (Object.prototype.hasOwnProperty.call(configFiles, param)) {
			const filePath = configFiles[param];

			let json,
				newConfig;

			try {
				json = await readFileAsync(filePath);
				newConfig = JSON.parse(json);
				config[param] = newConfig;
			} catch (error) {
				console.error('Error while reloading config:', filePath, error);
			}
		}
	}
	return true;
}

fileWatcher(Object.values(files)).on('change', () => {
	loadConfig(config, files);
});

module.exports = {
	config,
	loadConfig,
};