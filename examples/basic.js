const chalk = require('chalk');

const contrace = require('..')({
  showTimestamp: true,
  showLogType: true,
});

contrace.debug(contrace);

contrace.log('Log method is the simplest method for logging out, mainly used to output just about anything you want.');
contrace.info('Info is there to announce certain information like events and notifications \u2139');
const obj = {
  foo: 'zvinonzi',
  bar: {
    wadii: 'hapana',
  },

  fn: function quoteGhonyeti () {
    // ... do stuff in here
    let ghonyetiQuote = 'Magi wanga wagarisa uri side-chick!';
    return ghonyetiQuote;
  },

  thinga: 76234,
  mabob: '\u{1f604}',

  murayini: [
    {
      a: 'ehe',
      b: 'baz',
      c: 'caz',
    },
    2042,
    [
      x => console.log(x),
      "Life is knowing God",
    ],
    "five",
    'seven',
  ],
};
obj.recursive = obj;
contrace.debug(chalk`Debug is there for trying to figure out variable contents etc. You use it temporarily to track certain values etc. Here a circular reference is introduced to show that it can handle circular structures. It tries to make sure everything still looks like js and is readable, take a look at this debug of {bold obj}:`, obj);

contrace.warn('Warning is for generally giving warning about something that you think can cause issues');
contrace.error('Error prints out errors WITH a stack trace');
contrace.fatal('Fatal prints out fatal errors WITHOUT a stack trace');

contrace.log(chalk`All these can output {cyan colored text} {green that you can format} {keyword('hotpink') using Chalk}`);
contrace.error('Any of the methods format your code the same (take note of "const", it\'s not in the source): ', fibonacci = n => n <= 1 ? 1:fibonacci(n - 1) + fibonacci(n - 2) );
