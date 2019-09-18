var Readable      = require('stream').Readable;
var util          = require('util');
var child_process = require('child_process');
var spawn = child_process.spawn;

var UnrarStream = function (options) {
  Readable.call(this);
  this.options = options;
  this._unrarBin = options.bin || '';
  this._errormsg = '';
};
util.inherits(UnrarStream, Readable);

UnrarStream.prototype._read = function () {
  var self = this;
  if (!self._spawned) {
    self._spawn();
    self._spawned = true;
  }
  var chunk = self._unrar.stdout.read();
  if (chunk === null) {
    return self.push('');
  }
  self.push(chunk);
};

UnrarStream.prototype._spawn = function () {
  var self = this;

  var args = [
    'p',
    '-n' + self.options.entryname, //Specify file
    '-idq'                         //Disable messages
  ];
  args = args.concat(self.options.arguments);

  args.push(self.options.filepath);

  self._unrar = spawn((self._unrarBin) ? self._unrarBin : 'unrar', args);

  self._unrar.stderr.on('readable', function () {
    var chunk;
    while ((chunk = this.read()) !== null) {
      self._errormsg += chunk.toString();
    }
  });

  self._unrar.stdout.on('end', function () {
    self.push(null);
  });

  self._unrar.stdout.on('readable', function () {
    self.read(0);
  });

  self._unrar.on('exit', function (code) {
    if (code !== 0 || self._errormsg) {
      var msg = 'Unrar terminated with code ' + code + '\n';

      if (code === 10) {
        msg = 'There is no such entry: ' + self.options.entryname + '\n' + msg;
      }

      msg += self._errormsg;
      var error = new Error(msg);
      error.exitCode = code;
      self.emit('error', error);
    }
    self.emit('close');
  });
};

module.exports = UnrarStream;
