var Unrar = require('../index.js');

var archive = new Unrar('archive.rar');
// or
// var archive = new Unrar({
//   path:      protectedArchivePath,
//   arguments: ['-pPassword']
// });

archive.list(function (err, entries) {
  var stream = archive.stream('binary'); // name of entry
  stream.on('error', console.error);
  stream.pipe(require('fs').createWriteStream('some-binary-file'));
});
