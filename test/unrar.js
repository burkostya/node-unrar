var path = require('path');
var MemoryStream = require('memorystream');

var expect = require('chai').expect;

var Unrar = require('../index.js');

describe('unrar', function () {
  var archivePath = path.resolve(__dirname, 'archive.rar');
  var protectedArchivePath = path.resolve(__dirname, 'archive-pass.rar');
  var multipartArchivePath = path.resolve(__dirname, 'archive.part1.rar');
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
  it('should list all multipart entries', function (done) {
    var archive = new Unrar(multipartArchivePath);
    archive.list(function onListEntries (err, entries) {
      expect(err).to.not.exist;
      expect(entries).to.have.length(6);
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
  it('should accept archives with white spaces in name', function (done) {
    var archive = new Unrar(path.resolve(__dirname, 'archive with spaces in name.rar'));
    archive.list(function onListEntries (err, entries) {
      expect(err).to.not.exist;
      expect(entries).to.have.length(5);
      var stream = archive.stream(entries[0].name);
      var memStream = MemoryStream.createWriteStream();
      memStream.on('finish', function() {
        done();
      });
      stream.pipe(memStream);
    });
  });
});
