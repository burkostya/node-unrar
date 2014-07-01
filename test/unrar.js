var path = require('path');

var expect = require('chai').expect;

var Unrar = require('../index.js');

describe('unrar', function () {
  var archivePath = path.resolve(__dirname, 'archive.rar');
  var protectedArchivePath = path.resolve(__dirname, 'archive-pass.rar');
  it('should list entries', function (done) {
    var archive = new Unrar(archivePath);
    archive.list(function onListEntries (err, entries) {
      expect(err).to.not.exist;
      expect(entries).to.have.length(5);
      done();
    });
  });
  it('should accept unrar arguments', function (done) {
    var archive = new Unrar({
      path:      protectedArchivePath,
      arguments: ['-p-']
    });
    archive.list(function onListEntries (err, entries) {
      expect(err).to.not.exist;
      expect(entries).to.have.length(5);
      done();
    });
  });
  describe('stream', function() {
    it('should extract entry', function (done) {
      var archive = new Unrar({
        path:      protectedArchivePath,
        arguments: ['-pPassword']
      });
      var stream = archive.stream('binary');
      var data = Buffer(0);
      stream.on('readable', function onReadable () {
        var chunk;
        while ((chunk = stream.read()) !== null) {
          data = Buffer.concat([data, chunk]);
        }
      });
      stream.on('end', function onEnd () {
        expect(data).to.eql(new Buffer([0x01, 0x02, 0x03, 0x04, 0x05]))
        done();
      });
      stream.on('error', done);
    });
  });
});
