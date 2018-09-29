# Contrace

Console trace is a console package that tells you info about where each log occured and in which file. It's often difficult to come up with the source of a log and remember to remove or silence logs. Contrace simplifies this by printing out the source line and file from where the log occured. It does this in a neat fashion and is completely customizable.


## Installation

```sh
npm install contrace
```

## Usage

```js
const contra = require('contrace')(/* options */);

const obj = {
  foo: 'inonzi',
  bar: {
    wadii: 'hapana',
  },
  fn: function fanikisheni () {
    // ... do stuff in here
    let zvikazoti = 'this that what what';

    return value;
  },
  thinga: 76234,
  mabob: 0x847,
  murayini: [
    {a: 'ehe'},
    2,
    5,
    'five',
    'blah',
  ],
};

contra.debug('this is the result of obj: ', obj);
```

After you require the package into your module, you use it like console. The above example outputs:

![Example 01](examples/basic.png)

## Options

You pass in options as a dictionary to the initialization function ie `const contra = require('contrace')({ /* options */ });`:

- showMethod {boolean}: show the method from where the log occured. Default: false
- divider {boolean}: use divs to divide log entries. Default: false
[wip] more options documentations

## Author

Emmanuel Mahuni

## Attributions

[Tracer](https://www.npmjs.com/package/tracer) A powerful and customizable logging library for node.js.

[Chroma-fi](https://www.npmjs.com/package/chromafi) cli syntax highlighting: any function - any object - 176 languages

## Github

https://github.com/emahuni

## License

Emmanuel Mahuni (c) 2018 MIT