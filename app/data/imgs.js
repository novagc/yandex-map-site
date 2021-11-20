const 
    fs = require('fs'),
    chokidar = require('chokidar');

const 
    imgs = {
        names: []
    },
    watcher =  chokidar.watch(`${__dirname}/../public/img/marks`, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
    });

function LoadFileList() {
    imgs.names = fs.readdirSync(`${__dirname}/../public/img/marks`, {withFileTypes: true})
        .filter(x => !x.isDirectory())
        .filter(x => x.name.endsWith('.png'))
        .map(x=>x.name);
}

function StartWatch() {
    watcher.on('add', LoadFileList);
    watcher.on('unlink', LoadFileList);
}

LoadFileList();
StartWatch();

module.exports = imgs;