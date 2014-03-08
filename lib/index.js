#!/usr/bin/env node

// Notamos la lista
function list(val) {
	return val.split(',');
}
// Librerias
const fs	= require('fs');
const path	= require('path');
const program= require('commander');
const _		= require('underscore');
const master= require( path.join(path.join( __dirname, '..' ), 'package.json' ) );

// Expressiones regulares
const EXPR = /require\([\'|\"][a-z|0-9|\_|\-|\.]*[\'|\"]\)/gim;
const SYSS = /^(?:fs|os|path|http|events|util|domain|cluster|buffer|stream|string_decoder|crypto|tls|net|dgram|dns|url|https|punycode|readline|repl|vm|child_process|assert|zlib|sys)$/i;

// Titulo
process.title = program._name = program.name = master.name.replace('modules', '');

// Comandos
program
	.version(master.version)
	.usage('<app>')
	.option('-i, --ingore <path>', 'Ignore path')
	.option('-d, --depencie <simbol>', 'The simbol wit use Eg. ">="', '>=')
	.option('-t, --types <types>', 'Ignore files', list )
	.option('-f, --files <type>', 'specify the type of file Eg. .js ', '.js' )
	.parse(process.argv);

// Variables
program.types = program.types || [ 'min.js$' ];
var app = path.resolve( program.args[0] || __dirname );
var requires = [];
var tipo = new RegExp( program.files + '$', 'i' );
var noes = [ /.git|node_modules/i ];
var str = '    "%s" : "%s",';

for (var i = program.types.length - 1; i >= 0; i--)
	noes.push( new RegExp( program.types[i], 'i' ) );
// Leeemos recursibamente el directorio
require('wrench').readdirSyncRecursive(app).forEach(function (name) {
	var file = path.join(app, name);
	var isOk1 = _.find( noes, function(num){
		return num.test( name );
	});
	var Ok = fs.statSync(file).isFile() && tipo.test( name );
	if ( Ok && _.isEmpty(isOk1) ) {
		// Leemos y consultamos
		var datas = fs.readFileSync( file ).toString('utf8');
		requires = _.union( requires, datas.match(EXPR) || [] );
	}
});

var pkginfo = require('pkginfo');
console.log('\n  \"dependencies\": {');
requires.forEach( function (line){
	var line = line.replace('require(', '')
					.replace(/\'|\"/gim, '')
					.replace(')', '')
					.toLowerCase();
	try {
		// Obtemenos el paquete
		var requi = require(line);
		var ver = requi.version || requi.VERSION;
		if( _.isString(ver) )
			return console.log(str, line, program.depencie + ver );

		var requi = require.resolve(line)
				.replace('index.js', '')
				.replace('lib/', '')
				.replace(line + '.js', '');
		try {
			// Obtenemos el package
			var requi = require(path.join( requi, 'package.json' ));
			console.log(str, line, program.depencie + requi.version  );
		} catch (e) {
			try {
				// Obtenemos la infotmacion
				var info = pkginfo(line, 'version');
				console.log(str, line, program.depencie  + info.version );
			} catch(e){
				if( !SYSS.test(line) && !_.isEmpty(line) )
					console.log(str, line, '*' );
			}
		}
	} catch (e) {
		// No esta instalado o es de sistema
		if( !SYSS.test(line) && !_.isEmpty(line) )
			console.log(str, line, '*' );
	}
});
console.log('  } \n');