# unrar

Unrars rar archives with `unrar` utility

## Installation

`npm install unrar`

You must have `unrar` tool in the path.
For windows download from http://www.rarlab.com/rar_add.htm

## Example

```js
var Unrar = require('unrar');

var archive = new Unrar('archive.rar');
// or
// var archive = new Unrar({
//   path:      protectedArchivePath,
//   arguments: ['-pPassword'],
//   bin: pathToUnrarBin // Default: unrar
// });

archive.list(function (err, entries) {
  var stream = archive.stream('some_binary_entry'); // name of entry
  stream.on('error', console.error);
  stream.pipe(require('fs').createWriteStream('some-binary-file'));
});
```

## Usage

```js
var Unrar = require('unrar');
```

## API

### Constructor

```js
var archive = new Unrar('/path/to/some/file.rar');
```

* `options` *String|Object* File path or options object
  - `path` *String* File path
  - `arguments` *Array* Additional arguments for `unrar` command

### archive.list(callback)

* `callback` *Function*
  - `error` Error
  - `entries` *Array* Descriptions of archive entries

### archive.stream(entryName)

* `entryName` *String* Name of entry for extracting

Returns readable stream
