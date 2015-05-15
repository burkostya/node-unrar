var child_process = require('child_process');
var exec  = child_process.exec;

var UnrarStream = require("./lib/stream.js");

/**
 * constructor
 * @param {String|Object} options File path or options
 */
var Unrar = function (options) {
  this._arguments = options.arguments || [];
  this._filepath  = options.path || options;
  this._failOnPasswords = options.failOnPasswords || false;
};

/**
 * Lists entries of archive
 * @param  {Function} done Callback
 * @return {Array}         Entries
 */
Unrar.prototype.list = function (done) {
  var self = this;

  self._exec(['vt'], function (err, stdout) {
    if (err) { return done(err); }
    var chunks = stdout.split('\n\n');
    chunks = chunks.slice(2, chunks.length - 1);
    var list = chunks.map(extractProps);
    done(null, list);
  });
};

/**
 * Creates readable stream of entry
 * @param  {String} entryname Name of entry
 * @return {Object}           Readable stream
 */
Unrar.prototype.stream = function (entryname) {
  return new UnrarStream({
    entryname: entryname,
    filepath:  this._filepath,
    arguments: this._arguments
  });
};

/**
 * Executes unrar
 * @private
 * @param  {Array}    args Arguments
 * @param  {Function} done Callback
 */
Unrar.prototype._exec = function (args, done) {
  var self = this;
  args = args.concat(self._arguments);
  var command =
  'unrar ' +
  args.join(' ') +
  ' ' + self._filepath;
  exec(command, function (err, stdout, stderr) {
    if (err) { return done(err); }
    if (stderr.length > 0) { return done(new Error(stderr)); }
    if (stdout.length > 0 && stdout.match(/.*is not RAR archive.*/g)) { return done(new Error('Unsupported RAR file.')); }
    if (stdout.length > 0 && stdout.match(/.*Checksum error in the encrypted file.*/g)) { return done(new Error('Invalid Password.')); }
    if (self._failOnPasswords && stdout.match(/.*Flags: encrypted.*/g)) { return done(new Error('Password protected file')); }
    done(null, stdout);
  });
};

/**
 * Normalizes description of entry
 * @param  {Buffer} raw Chunk
 * @return {Object} Parsed description
 */
function extractProps (raw) {
  var desc = {};

  var props = raw.split('\n');
  props.forEach(function (prop) {
    prop = prop.split(': ');
    var key = normalizeKey(prop[0]);
    var val = prop[1];
    desc[key] = val;
  });

  return desc;
}

/**
 * Normalizes keys of entry description
 * @param  {String} key Raw key
 * @return {String}     Normalized key
 */
function normalizeKey (key) {
  var normKey = key;
  normKey = normKey.toLowerCase();
  normKey = normKey.replace(/^\s+/, '');

  var keys = {
    'name':        'name',
    'type':        'type',
    'size':        'size',
    'packed size': 'packedSize',
    'ratio':       'ratio',
    'mtime':       'mtime',
    'attributes':  'attributes',
    'crc32':       'crc32',
    'host os':     'hostOS',
    'compression': 'compression',
    'flags':       'flags'
  };
  return keys[normKey] || key;
}

module.exports = Unrar;
