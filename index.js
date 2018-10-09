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

function wrapMsg (msg, indentFirst = false, opts) {
  let indent = opts.gutterLen;

  // msg = msg.substr(width);
  let sep = chalk`{grey.bold \u2502 }`,
      gutter = ''.padStart(indent - 2).concat(sep); // the 2 is the visual length of sep

  let width = process.stdout.columns - indent;
  //    console.log('width: ', width);

  // wrap the msg, remove windows line endings and use unix line endings, then use gutter indention
  msg = wrap(msg, width, {trim: false, hard: true}).replace(/\r\n/g, '\n').replace(/\n/g, '\n' + gutter) ;// {

  msg = indentFirst ? gutter + msg: sep + msg; // correct the first indention according to opts
  if(opts.divider) {
    msg = msg + '\n'.padEnd(indent - 1, '\u2500') + '\u253C' + chalk.dim(''.padEnd(width , '\u2500')); // put divider
  }

  // return the msg
  return msg; //.replace(/\n[\s]*?\n/g, '\n');    // remove broken formatting
}


module.exports = function (opts) {
  opts = _.merge(
    // default opts
    {
      divider: false,
      showFile: true,
      showMethod: false,
      showTimestamp: false,
      ellipse: '…', // single char ellipse
      lineNumLen: 4,
      pathLen: 35,
      timestampLen: 12,
      fileLen: null, // autocalc from pathLen if null, if both methodLen and fileLen are defined (this plus methodLen - 1) == pathLen
      methodLen: null,  // autocalc from pathLen if null, if both methodLen and fileLen are defined (this plus fileLen - 1) == pathLen
    },
    // user opts
    opts
  );

  opts.methodLen = opts.showMethod ? (opts.methodLen || (opts.fileLen ? (opts.pathLen - opts.fileLen - 1) : ((opts.pathLen - 1)/2))): 0; // - 1 is there for the separator between path and method
  opts.fileLen = opts.showFile ? (opts.fileLen || opts.methodLen ? opts.pathLen - opts.methodLen - 1 : opts.pathLen): 0; // - 1 is there for the separator between path and method
  opts.timestampLen = opts.showTimestamp ? 3 + opts.timestampLen: 0;

  let file = opts.showFile ? '\{\{file\}\}':'',
      method = opts.showMethod ? ':\{\{method\}\}':'',
      timestamp = opts.showTimestamp ? ' - \{\{timestamp\}\}' :'' ;

  // the indentation length ( including spaces and sep char). Each number represents spaces or separation chars
  opts.gutterLen = 1 + opts.lineNumLen + 1 + opts.fileLen + (opts.showMethod ? 1:0) + opts.methodLen + opts.timestampLen + 3;

  // now create the tracer opts to merge with the opts
  opts = _.merge(
    // default tracer options and the functionality thereof
    {
      format : [
        chalk`{dim @\{\{line\}\} ${file}${method}${timestamp}} \{\{message\}\}`, //default format
        {
          info: chalk`{cyan.dim @\{\{line\}\} ${file}${method}${timestamp}} \{\{message\}\}`,
          debug: chalk`{blue.dim @\{\{line\}\} ${file}${method}${timestamp}} \{\{message\}\}`,
          verbose: chalk`{grey.dim @\{\{line\}\} ${file}${method}${timestamp}} \{\{message\}\}`,
          warn: chalk`{keyword('orange').dim @\{\{line\}\} ${file}${method}${timestamp}} \{\{message\}\}`,
          error: chalk`{red.dim @\{\{line\}\} ${file}${method}${timestamp}} \{\{message\}\}\n\{\{stack\}\}`,
          // error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}"
        }
      ],

      dateformat : "HH:MM:ss.l",
      preprocess :  function(data){
        // data.title = data.title.toUpperCase();

        data.line = data.line.padStart(opts.lineNumLen);
        data.file = path.dirname(data.path) + path.sep + ellipsize(data.file, opts.fileLen / 1.5); // concatenate path and file name (ellipsize the fn if > fileLen/1.5)
        data.file = data.file.length > opts.fileLen ? opts.ellipse + data.file.slice((opts.fileLen - opts.ellipse.length) * -1)  : data.file ; // trime excess path chars
        data.method = opts.showMethod ? ellipsize(data.method, opts.methodLen).padEnd(opts.methodLen): null;

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
        data.args = [wrapMsg(util.format(...data.args), false, opts)]; // combine the whole args array into one message and wrap it befor passing it back

        data.stack = wrapMsg(data.stack, true, opts);
      }
    },

    // overriding of passed user opts
    opts
  );

  return require('tracer')
    .colorConsole(opts);
};
