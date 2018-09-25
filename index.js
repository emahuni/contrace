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
    },
    // user opts
    opts
  );

  // now create the tracer opts to merge with the opts
  opts = _.merge(
    // default tracer options and the functionality thereof
    {
      format : [
        chalk`{dim @\{\{line\}\} \{\{file\}\}:\{\{method\}\} } \{\{message\}\}`, //default format
        {
          info: chalk`{cyan.dim @\{\{line\}\} \{\{file\}\}${opts.showMethod ? ':\{\{method\}\}':'' }} \{\{message\}\}`,
          debug: chalk`{blue.dim @\{\{line\}\} \{\{file\}\}${opts.showMethod ? ':\{\{method\}\}':'' } } {reset.red \{\{message\}\} }`,
          verbose: chalk`{grey.dim @\{\{line\}\} \{\{file\}\}${opts.showMethod ? ':\{\{method\}\}':'' } } \{\{message\}\}`,
          warn: chalk`{keyword('orange').dim @\{\{line\}\} \{\{file\}\}${opts.showMethod ? ':\{\{method\}\}':'' } } \{\{message\}\}`,
          error: chalk`{red.dim @\{\{line\}\} \{\{file\}\}${opts.showMethod ? ':\{\{method\}\}':'' } } \{\{message\}\}\n\{\{stack\}\}`,
          // error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}"
        }
      ],

      dateformat : "HH:MM:ss.L",
      preprocess :  function(data){
        // data.title = data.title.toUpperCase();

        data.line = data.line.padStart(3);
        let nlen = opts.showMethod ? 16:32;
        data.file = path.dirname(data.path) + path.sep + ellipsize(data.file, nlen - 2);//.padStart(16); // concatenate path and file name
        data.file = data.file.length > nlen ? '...' + data.file.slice((nlen - 3) * -1)  : data.file ; // trime excess path and have a total of 16 chars left
        data.method = opts.showMethod ? ellipsize(data.method, nlen - 2).padEnd(nlen): null;

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
