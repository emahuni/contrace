const util = require('util'); // todo: use stringkit instead
const path = require('path'); // use another lib here, this will limit it to nodejs only or otherwise we need compiling

// console.log(process.stdout.columns);
const typeOf = require('type-detect');
const ellipsize = require('ellipsize');
// const wrap = require('word-wrap');
const wrap = require('wrap-ansi');  // todo find a replacement for this module, it's not compatible with webpack
const chalk = require('chalk'); // todo we need a browser compatible version of this
const _ = require('lodash');
const chromafi = require('chromafi');

let clockIndex = 0;

/**
 * wrap given msg string using specified options
 * @param {string} msg the string message to wrap
 * @param {boolean} indentFirst indent the first line
 * @param {object} opts
 * @returns {string} wrapped msg
 */
function wrapMsg (msg, indentFirst = false, opts) {
  let indent = opts.gutterLen;

  let sep = chalk`{grey.dim ┅╋ }`,
      emptyGutter = ''.padEnd(opts.typeLen + opts.lineNumLen, ' ').concat(chalk`{grey.dim  ┃}`).concat(''.padEnd(indent - (opts.showLogType ? 4 : 3) - opts.typeLen - opts.lineNumLen).concat(chalk`{grey.dim ┊ }`)); // the 2 is the visual length of sep

  let width = process.stdout.columns - indent - 2;
  //    console.log('width: ', width);

  // wrap the msg, remove windows line endings and use unix line endings, then use gutter indention  replacing the start line sep with a dotted one to show wraps
  msg = wrap(msg, width, {trim: false, hard: true}).replace(/\r\n/g, '\n').replace(/\n/g, '\n' + emptyGutter);

  msg = indentFirst ? emptyGutter + msg: sep + msg; // correct the first indention according to opts
  if(opts.divider) {
    msg = msg + '\n'.padEnd(indent - 1, '\u2500') + '\u253C' + chalk.dim(''.padEnd(width , '\u2500')); // put divider
  }

  // return the msg
  return msg; //.replace(/\n[\s]*?\n/g, '\n');    // remove broken formatting
}

/**
 * apply colors to log portions
 * @param {object} the data object that should be used for formatting
 * @param {object} opts
 */
function colorPortions (data, opts){
  let i = 0;
  for (let m of ['title', 'timestamp', 'line', 'file', 'method', 'msg', 'message', 'stack', ]){
    if(!_.isEmpty(data[m])){
      data[m] = chalk.keyword(opts.colors.levels[i++])(data[m]);
    }
  }
}


module.exports = function (opts) {
  opts = _.merge(
    // default opts
    {
      divider: false,
      showLogType: true,
      showFile: true,
      showMethod: false,
      showTimestamp: true,
      ellipse: '…', // single char ellipse

      typeLen: 5,
      lineNumLen: 4,
      pathLen: 35,
      timestampLen: 13,
      fileLen: null, // autocalc from pathLen if null, if both methodLen and fileLen are defined (this plus methodLen - 1) == pathLen
      methodLen: null,  // autocalc from pathLen if null, if both methodLen and fileLen are defined (this plus fileLen - 1) == pathLen

      colors: {
        levels: [
          'white',  // log
          'grey',  // trace
          'cyan',  // debug
          'green',  // info
          'orange',  // warn
          'red',  // error
          'orangered',  // fatal
        ]
      },
    },
    // user opts
    opts
  );

  opts.methodLen = opts.showMethod ? (opts.methodLen || (opts.fileLen ? (opts.pathLen - opts.fileLen - 1) : ((opts.pathLen - 1)/2))) : 0; // - 1 is there for the separator between path and method
  opts.fileLen = opts.showFile ? (opts.fileLen || opts.methodLen ? opts.pathLen - opts.methodLen - 1 : opts.pathLen) : 0; // - 1 is there for the separator between path and method
  opts.timestampLen = opts.showTimestamp ? 3 + opts.timestampLen : 0;
  opts.typeLen = opts.showLogType ? 1 + opts.typeLen : 0;

  // easter egg, animating clock:
  let clocks = '🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗 🕘 🕙 🕚 🕛'.split(' ');

  let file = opts.showFile ? '\{\{file\}\}':'',
      method = opts.showMethod ? ':\{\{method\}\}':'',
      timestamp = opts.showTimestamp ? ` \{\{clock\}\}⁞\{\{timestamp\}\}` :'',
      typeSep = '⁙';

  let logTxt = opts.showLogType ? chalk.keyword(opts.colors.levels[0]).dim(`  Log${typeSep}`) : '',
      traceTxt = opts.showLogType ? chalk.keyword(opts.colors.levels[1]).dim(`Trace${typeSep}`) : '',
      verboTxt = opts.showLogType ? chalk.keyword(opts.colors.levels[1]).dim(`Verbo${typeSep}`) : '',
      debugTxt = opts.showLogType ? chalk.keyword(opts.colors.levels[2]).dim(`Debug${typeSep}`) : '',
      infoTxt = opts.showLogType ? chalk.keyword(opts.colors.levels[3]).dim(` Info${typeSep}`) : '',
      warnTxt = opts.showLogType ? chalk.keyword(opts.colors.levels[4]).dim(` Warn${typeSep}`) : '',
      errorTxt = opts.showLogType ? chalk.keyword(opts.colors.levels[5]).dim(`Error${typeSep}`) : '';
      fatalTxt = opts.showLogType ? chalk.keyword(opts.colors.levels[6]).dim(`Fatal${typeSep}`) : '';

  // the indentation length ( including spaces and sep char). Each number represents spaces or separation chars
  opts.gutterLen = opts.typeLen + (opts.showLogType ? 1 : 0) + opts.lineNumLen + 1 + opts.fileLen + (opts.showMethod ? 1 : 0) + opts.methodLen + opts.timestampLen + 3;

  // now create the tracer opts to merge with the opts
  opts = _.merge(
    // default tracer options and the functionality thereof
    {
      format : [
        `${logTxt}\{\{line\}\}${file}${method}${timestamp}\{\{message\}\}`, //default format
        {
          trace: `${traceTxt}\{\{line\}\}${file}${method}${timestamp}\{\{message\}\}`,
          verbose: `${verboTxt}\{\{line\}\}${file}${method}${timestamp}\{\{message\}\}`,
          debug: `${debugTxt}\{\{line\}\}${file}${method}${timestamp}\{\{message\}\}`,
          info: `${infoTxt}\{\{line\}\}${file}${method}${timestamp}\{\{message\}\}`,
          warn: `${warnTxt}\{\{line\}\}${file}${method}${timestamp}\{\{message\}\}`,
          error: `${errorTxt}\{\{line\}\}${file}${method}${timestamp}\{\{message\}\}\n\{\{stack\}\}`,
          fatal: `${fatalTxt}\{\{line\}\}${file}${method}${timestamp}\{\{message\}\}\n\{\{stack\}\}`,
          // error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}"
        }
      ],

      dateformat : "HH:MM:ss.l",
      preprocess :  function(data){
        // console.dir(data, {depth: null, colors: true});
        // data.title = data.title.toUpperCase();

        // get the next clock
        data.clock = clocks[clockIndex < clocks.length ? clockIndex++: (clockIndex = 0)];
        data.timestamp = chalk.keyword(opts.colors.levels[data.level])(data.timestamp); // use the correct colour for timestamp

        data.line = chalk.keyword(opts.colors.levels[data.level])(data.line.padStart(opts.lineNumLen, ' ')).concat(chalk`{grey.dim ┅┫}`);

        // concatenate path and file name (ellipsize the fn if > fileLen/1.5)
        data.file = path.dirname(data.path) + path.sep + ellipsize(data.file, opts.fileLen / 1.5);
        // trime excess path chars
        data.file = data.file.length > opts.fileLen ? opts.ellipse + data.file.slice((opts.fileLen - opts.ellipse.length) * -1): data.file;
        data.file = chalk.keyword(opts.colors.levels[data.level])(data.file); // use the correct colour for file

        data.method = opts.showMethod ? ellipsize(data.method, opts.methodLen).padEnd(opts.methodLen): null;
        data.method = chalk.keyword(opts.colors.levels[data.level])(data.method); // use the correct colour for method

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
        // console.log(opts.colors.levels);
        // console.log('level: ', data.level);
        // console.log('color: ', opts.colors.levels[data.level]);
        data.args = [wrapMsg(chalk.keyword(opts.colors.levels[data.level])(util.format(...data.args)), false, opts)]; // combine the whole args array into one message and wrap it befor passing it back

        data.stack = wrapMsg(chalk.keyword(opts.colors.levels[data.level])(data.stack), true, opts);
      }
    },

    // overriding of passed user opts
    opts
  );

  return require('tracer')
    .colorConsole(opts);
};
