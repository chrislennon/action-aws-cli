'use strict';

const promisify = require('js-promisify');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const firstline = require('../index.js');
const mocks = require('./mocks.js');

chai.should();
chai.use(chaiAsPromised);

describe('firstline', () => {

  const dirPath = path.join(__dirname, 'tmp/');
  const filePath = dirPath + 'test.txt';
  const wrongFilePath = dirPath + 'no-test.txt';

  before(() => fs.mkdirSync(dirPath)); // Make "tmp" folder

  after(() => rimraf.sync(dirPath)); // Delete "tmp" folder

  describe('#check', () => {

    afterEach(() => rimraf.sync(filePath)); // Delete mock CSV file

    it(
      'should reject if the file does not exist',
      () => firstline(wrongFilePath).should.be.rejected
    );

    it(
      'should return the first line of a file and default to `\\n` line ending',
      () => promisify(fs.writeFile, [filePath, 'abc\ndef\nghi'])
        .then(() => firstline(filePath).should.eventually.equal('abc'))
    );

    it(
      'should work correctly if the first line is long',
      () => promisify(fs.writeFile, [filePath, mocks.longLine])
        .then(() => firstline(filePath).should.eventually.equal(mocks.longLine.split('\n')[0]))
    );

    it(
      'should return an empty line if the file is empty',
      () => promisify(fs.writeFile, [filePath, ''])
        .then(() => firstline(filePath).should.eventually.equal(''))
    );

    it(
      'should work with a different encoding when specified correctly',
      () => promisify(fs.writeFile, [filePath, 'abc\ndef\nghi', { encoding: 'ascii' }])
        .then(() => firstline(filePath, { encoding: 'ascii' }).should.eventually.equal('abc'))
    );

    it(
      'should work with a different line ending when specified correctly',
      () => promisify(fs.writeFile, [filePath, 'abc\rdef\rghi'])
        .then(() => firstline(filePath, { lineEnding: '\r' }).should.eventually.equal('abc'))
    );

    it(
      'should return the entire file if the specified line ending is wrong',
      () => promisify(fs.writeFile, [filePath, 'abc\ndef\nghi'])
        .then(() => firstline(filePath, { lineEnding: '\r' }).should.eventually.equal('abc\ndef\nghi'))
    );

    it(
      'should handle BOM',
      () => promisify(fs.writeFile, [filePath, '\uFEFFabc\ndef'])
        .then(() => firstline(filePath).should.eventually.equal('abc'))
    );

  });

});
