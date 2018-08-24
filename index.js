const util = require('util');
// console.log(process.stdout.columns);
const typeOf = require('type-detect');
const ellipsize = require('ellipsize');
const wrap = require('word-wrap');
const chalk = require('chalk');
const map = require('lodash/map');
const chromafi = require('chromafi');

function wrapMsg (msg, indent) {
		let width = process.stdout.columns - indent - 2;
		//		console.log('width: ', width);

		// if(msg.length > width){
		// let flb = msg.indexOf('\n'); // first line break
		// console.log('flb: ', flb);
		// let firstLine = (flb === -1 || flb > width) ? msg.substring(0, width) : msg.substring(0, flb);
		// firstLine = '| ' + firstLine;
		// console.log('firstLine: ',  firstLine);

		// msg = msg.substr(width);
		msg = wrap(msg, {
				width,
				indent: ''.padStart(indent).concat(chalk`{grey.bold | }`),
				// escape: function(string){
				// return string.padEnd(width, '~' );
				// },
		});

		// msg = firstLine + msg;
		// }

		return msg.trimLeft() + '\n'.padEnd(indent) + chalk.dim(''.padEnd(width, '°'));
}


module.exports = require('tracer')
    .colorConsole(
        {
            format : [
                chalk`{dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}`, //default format
                {
                    error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}" // error format
                }
            ],
						// filter: [
						// wrapMsg,	
						// ],
            dateformat : "HH:MM:ss.L",
            preprocess :  function(data){
                data.title = data.title.toUpperCase();
								
								data.line = data.line.padStart(3);
								data.file = ellipsize(data.file, 14).padStart(16);
								data.method = ellipsize(data.method, 14).padEnd(16);
								// make sure that we use chromafi to get nice looking object
								data.args = map(data.args, a =>{
										if([ 'object', 'function', 'array'].includes(typeOf(a).toLowerCase())){
												a = chromafi(a, {
														// lineNumberPad: 0,
														// codePad: 2,
														// indent: 4,
														lineNumbers: true,
														colors: {
																base: chalk.bold,
																keyword: chalk.cyan,
																number: chalk.yellow,
																function: chalk.white,
																// : chalk.green,
																comment: chalk.grey,
																title: chalk.blue,
																params: chalk.yellow,
																string: chalk.green,
																builtIn: chalk.magenta,
																literal: chalk.blue,
																attr: chalk.keyword('orange'),
																// Just pass `chalk` to ignore colors
																// trailingSpace: chalk.red,
																regexp: chalk.blue,
																// lineNumbers: chalk.grey,
														}
												});
										}
										
										return a;
								});
								// console.dir(data.args, {depth: null, colors: true});
								data.args = [wrapMsg(util.format(...data.args), 40)]; // combine the whole args array into one message and wrap it befor passing it back
								// data.message = 'aksjdlhlf';//wrap(data.message, {width: 24, indent: ''.padStart(60).concat('| ')});
								// data.message = wrap(data.message, {width: process.stdout.columns - 62, indent: ''.padStart(60).concat('| ')});
								// .replace(/\n/g, "\n" + " ".repeat(49) + " | ")
								// .replace(/\\n/g, "\n")
								// .replace(/\\/g, '')
								// .concat("\n");
            }
        });
