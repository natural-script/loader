const os = require('os');
const zlib = require('zlib');
const fs = require('fs');
const shell = require('shelljs');
const figlet = require('figlet');

figlet('JSTE LOADER', function(err, data) {
console.log(data);
console.log(' Starting building Jste Loader ');
shell.cd('build');
shell.rm('-rf', '*');
shell.mkdir('minified', 'compressed');
console.log(' Minifying the loader ');
shell.exec('npx uglifyjs --compress --mangle -- ../src/loader.js > minified/loader.min.js');
shell.exec('npx uglifyjs --compress --mangle -- ../src/loader-CodePenVersion.js > minified/loader-CodePenVersion.min.js');
console.log(' Compresssing the loader minified file ');
var gzip = zlib.createGzip(); 
var inp = fs.createReadStream('minified/loader.min.js');
var out = fs.createWriteStream('compressed/loader.min.js.gz');
var gzip = zlib.createGzip(); 
var inp = fs.createReadStream('minified/loader-CodePenVersion.min.js');
var out = fs.createWriteStream('compressed/loader-CodePenVersion.min.js.gz');
inp.pipe(gzip).pipe(out);
console.log(' Jste Loader has been built properly ;) ');
});
