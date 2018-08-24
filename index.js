const util = require('util');
// console.log(process.stdout.columns);
const typeOf = require('type-detect');
const ellipsize = require('ellipsize');
const wrap = require('word-wrap');
const chalk = require('chalk');
const _ = require('lodash');
const chromafi = require('chromafi');

function wrapMsg (msg, indent, indentFirst = false) {
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

		msg = indentFirst ? msg : msg.trimLeft();
		return msg + '\n'.padEnd(indent) + chalk.dim(''.padEnd(width, '°'));
}


module.exports = function (opts) {
		return require('tracer')
				.colorConsole(_.merge({
						format : [
								chalk`{dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}`, //default format
								{
										info: chalk`{cyan.dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}`, 
										debug: chalk`{blue.dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}`,
										warn: chalk`{keyword('orange').dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}`, 
										error: chalk`{red.dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}\n\{\{stack\}\}`,
										// error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}" 
								}
						],
						// filter: [
						// wrapMsg,	
						// ],
						dateformat : "HH:MM:ss.L",
						preprocess :  function(data){
								// data.title = data.title.toUpperCase();
								
								data.line = data.line.padStart(3);
								data.file = data.path + ellipsize(data.file, 14);//.padStart(16); // concatenate path and file name
								data.file = data.file.length > 16 ? '...' + data.file.slice(-14)  : data.file ; // trime excess path and have a total of 16 chars left
								data.method = ellipsize(data.method, 14).padEnd(16);
								// make sure that we use chromafi to get nice looking object
								data.args = _.map(data.args, a =>{
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

								data.stack = wrapMsg(data.stack, 40, true).replace(/\n[\s]*?\n/g, '\n');

						}
				}, opts));
};
