const os = require('os');
const shell = require('shelljs');
const figlet = require('figlet');

figlet('JSTE LOADER', function(err, data) {
console.log(data);
console.log(' Starting building Jste Loader ');
shell.cd('build');
shell.rm('-rf', '*');
shell.mkdir('minified', 'compressed');
console.log(' Minifying the loader ');
shell.exec('uglifyjs --compress --mangle -- ../src/loader.js > minified/loader.min.js');
console.log(' Compresssing the loader minified file ');
shell.exec('cat minified/loader.min.js | gzip --best > compressed/loader.min.js.gz');
console.log(' Jste Loader has been built properly ;) ');
});
