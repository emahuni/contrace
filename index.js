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

function wrapMsg (msg, indent, indentFirst = false, opts) {
  let width = process.stdout.columns - indent - 2;
  //    console.log('width: ', width);

  // msg = msg.substr(width);
  let sep = chalk`{grey.bold | }`, gutter = ''.padStart(indent).concat(sep) ;
  // wrap the msg, remove windows line endings and use unix line endings, then use gutter indention
  msg = wrap(msg, width, {trim: false}).replace(/\r\n/g, '\n').replace(/\n/g, '\n' + gutter) ;// {

  msg = indentFirst ? gutter + msg: sep + msg; // correct the first indention according to opts
  if(opts.ruler) {
    msg = msg + '\n'.padEnd(indent) + chalk.dim(''.padEnd(width, '°')); // put ruler
  }

  // return the msg
  return msg; //.replace(/\n[\s]*?\n/g, '\n');    // remove broken formatting
}


module.exports = function (opts) {
  opts = _.merge(
    // default opts
    {
      ruler: false,
      showMethod: false,
      ellipse: '…', // single char ellipse
      lineNumLen: 4,
      pathLen: 34,
      fileLen: null, // autocalc from pathLen if null, if both methodLen and fileLen are defined (this plus methodLen - 1) == pathLen
      methodLen: null,  // autocalc from pathLen if null, if both methodLen and fileLen are defined (this plus fileLen - 1) == pathLen
    },
    // user opts
    opts
  );

  opts.methodLen = opts.showMethod ? (opts.methodLen || (opts.fileLen ? (opts.pathLen - opts.fileLen - 1) : (opts.pathLen/2) - 1)): 0; // - 1 is there for the separator between path and method
  opts.fileLen = opts.fileLen || opts.methodLen ? opts.pathLen - opts.methodLen - 1 : opts.pathLen; // - 1 is there for the separator between path and method

  // now create the tracer opts to merge with the opts
  opts = _.merge(
    // default tracer options and the functionality thereof
    {
      format : [
        chalk`{dim @\{\{line\}\} \{\{file\}\}${opts.showMethod ? ':\{\{method\}\}':'' }} \{\{message\}\}`, //default format
        {
          info: chalk`{cyan.dim @\{\{line\}\} \{\{file\}\}${opts.showMethod ? ':\{\{method\}\}':'' }} \{\{message\}\}`,
          debug: chalk`{blue.dim @\{\{line\}\} \{\{file\}\}${opts.showMethod ? ':\{\{method\}\}':'' }} {reset.red \{\{message\}\} }`,
          verbose: chalk`{grey.dim @\{\{line\}\} \{\{file\}\}${opts.showMethod ? ':\{\{method\}\}':'' }} \{\{message\}\}`,
          warn: chalk`{keyword('orange').dim @\{\{line\}\} \{\{file\}\}${opts.showMethod ? ':\{\{method\}\}':'' }} \{\{message\}\}`,
          error: chalk`{red.dim @\{\{line\}\} \{\{file\}\}${opts.showMethod ? ':\{\{method\}\}':'' }} \{\{message\}\}\n\{\{stack\}\}`,
          // error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}"
        }
      ],

      dateformat : "HH:MM:ss.L",
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
        data.args = [wrapMsg(util.format(...data.args), 40, false, opts)]; // combine the whole args array into one message and wrap it befor passing it back

        data.stack = wrapMsg(data.stack, 40, true, opts);
      }
    },

    // overriding of passed user opts
    opts
  );

  return require('tracer')
    .colorConsole(opts);
};
