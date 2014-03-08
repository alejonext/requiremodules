#!/usr/bin/env node

function list (val ){
	return val.split(',');
}

const fs	= require('fs');
const path	= require('path');
const program= require('commander');
const _		= require('underscore');
const master= require( path.join(path.join( __dirname, '..' ), "package.json" ) );
const EXPR = /require\([\'|\"][a-z|0-9]*[\'|\"]\)/gim;

process.title = program._name = program.name = master.name;

program
	.version(master.version)
	.usage('<app>')
	.option('-i, --ingore <path>', 'Ignore path')
	.option('-d, --depencie <simbol>', 'Ignore files', '>=')
	.option('-n, --nofiles <type>', 'Ignore files', '-min', list )
	.option('-f, --files <type>', 'specify the type of file', '.js' )
	.parse(process.argv);

var app = program.args || [ __dirname ];
var requires = [];
var tipo = new RegExp( program.files + '$', 'i' );
var noes = [ /.git/i, /node_modules/i ];
var str = '    "%s" : "%s",';

for (var i = program.nofiles.length - 1; i >= 0; i--)
	noes.push( new RegExp( program.nofiles[i], 'i' ) );

require('wrench').readdirSyncRecursive(app[0]).forEach(function (name) {
	var file = path.join(app[0], name);
	var isOk = !_.find( noes, function(num){
		return num.test( name );
	}) && fs.statSync(file).isFile() && tipo.test( name ) ;
	if ( isOk ) {
		var datas = fs.readFileSync( file ).toString('utf8');
		requires = _.union( requires, datas.match(EXPR) || [] );
	}
});

console.log("\n  \"dependencies\": {");
requires.forEach( function (line){
	var line = line.replace('require(', '')
					.replace(/\'|\"/gim, '')
					.replace(')', '')
					.toLowerCase();
	try {
		var requi = require(line);
		var ver = requi.version || requi.VERSION;

		if(_.isString(ver)){
			console.log(str, line, program.depencie + ver );
		} else {
			var requi = require.resolve(line)
						.replace('index.js', '')
						.replace('lib/', '')
						.replace(line + '.js', '');
			try {
				var requi = require(path.join( requi, 'package.json' ));
				console.log(str, line, program.depencie  + requi.version );
			} catch (e) {
				//console.log(str, line, "SYSTEM" );
			}
		}
	} catch (e) {
		console.log(str, line, "*" );
	}
});
console.log("  } \n");