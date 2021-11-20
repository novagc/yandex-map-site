const
	express = require('express'),
	session = require('express-session'),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	passportInit = require('./auth/passport'),
	{ config, loadConfig, } = require('./config/config'),
	app = new express();

function Start() {
    loadConfig(config).then(() => {
        passportInit();
    
        app.set('view engine', 'pug');
        app.set("views", `${__dirname}/views`); 

        app.use(express.static(`${__dirname}/public`));
        app.use(bodyParser());
        app.use(bodyParser.urlencoded());
        app.use(session({ secret: 'ASFDJLSKDJOVN', }));
    
        app.use(passport.initialize());
        app.use(passport.session());
    
        app.use(require('./routes/index'));
        app.use(require('./routes/points'));
        app.use(require('./routes/marks'));
        app.use(require('./routes/login'));
        app.use(require('./routes/editor'));
    
        console.log(`http://${config.server.host}:${config.server.port}`);

        app.listen(config.server.port);
    });
}

module.exports = { Start, };