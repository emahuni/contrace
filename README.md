# Contrace

Console trace is a console package that tells you info about where each log occured and in which file. It's often difficult to come up with the source of a log and remember to remove or silence logs. Contrace simplifies this by printing out the source line and file from where the log occured. It does this in a neat fashion and is completely customizable.


## Installation

```sh
npm install contrace
```

## Usage

```js
const con = require('contrace')(/*  [options] */);

con.log('your log output');
con.debug('your debug output');
con.dir('your dir output');
con.info('your info output');
con.warn('your warning output');
con.error('your error output');
```

After you require the package into your module, you use it like console. The above example outputs:

```

```


## Author

Emmanuel Mahuni

## Github

https://github.com/emahuni

## License

Emmanuel Mahuni (c) 2018 MIT