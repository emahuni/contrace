const util = require('util');
const path = require('path');

// console.log(process.stdout.columns);
const typeOf = require('type-detect');
const ellipsize = require('ellipsize');
// const wrap = require('word-wrap');
const wrap = require('wrap-ansi');
const chalk = require('chalk');
const _ = require('lodash');
const chromafi = require('chromafi');

function wrapMsg (msg, indent, indentFirst = false) {
		let width = process.stdout.columns - indent - 2;
		//		console.log('width: ', width);

		// msg = msg.substr(width);
		let sep = chalk`{grey.bold | }`, gutter = ''.padStart(indent).concat(sep) ;
		// wrap the msg, remove windows line endings and use unix line endings, then use gutter indention
		msg = wrap(msg, width, {trim: false}).replace(/\r\n/g, '\n').replace(/\n/g, '\n' + gutter) ;// {

		msg = indentFirst ? gutter + msg: sep + msg; // correct the first indention according to opts
		msg = msg + '\n'.padEnd(indent) + chalk.dim(''.padEnd(width, '°')); // put ruler

		// return the msg
		return msg; //.replace(/\n[\s]*?\n/g, '\n'); 		// remove broken formatting
}


module.exports = function (opts) {
		return require('tracer')
				.colorConsole(_.merge({
						format : [
								chalk`{dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}`, //default format
								{
										info: chalk`{cyan.dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}`,
										debug: chalk`{blue.dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}`,
										verbose: chalk`{grey.dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}`,
										warn: chalk`{keyword('orange').dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}`,
										error: chalk`{red.dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}\n\{\{stack\}\}`,
										// error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}"
								}
						],

						dateformat : "HH:MM:ss.L",
						preprocess :  function(data){
								// data.title = data.title.toUpperCase();

								data.line = data.line.padStart(3);
								data.file = path.dirname(data.path) + path.sep + ellipsize(data.file, 14);//.padStart(16); // concatenate path and file name
								data.file = data.file.length > 16 ? '...' + data.file.slice(-13)  : data.file ; // trime excess path and have a total of 16 chars left
								data.method = ellipsize(data.method, 14).padEnd(16);

								// make sure that we use chromafi to get nice looking object
								data.args = _.map(data.args, a =>{
										if([ 'object', 'function', 'array'].includes(typeOf(a).toLowerCase())){
												a = '\n' + chromafi(a, {
														// lineNumberPad: 0,
														codePad: 2,
														indent: 2,
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

								data.stack = wrapMsg(data.stack, 40, true);
						}
				}, opts));
};
