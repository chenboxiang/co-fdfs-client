/**
 * Author: chenboxiang
 * Date: 14-6-19
 * Time: 上午12:19
 */
'use strict';

var FdfsClient = require('../index')
var path = require('path')
var co = require('co')
var expect = require('expect.js')
var fs = require('fs')
var debug = require('debug')('fdfs')

/**
 * 比较两个Buffer对象是否相等
 * @param {Buffer} src
 * @param {Buffer} target
 * @return {Boolean}
 */
function isBufferEqual(src, target) {
    if (src.length !== target.length) {
        return false
    }
    for (var i = 0; i < src.length; i++) {
        if (src[i] !== target[i]) {
            return false
        }
    }
    return true
}

describe('co-fdfs', function() {
    var fdfs
    before(function() {
        fdfs = new FdfsClient({
            trackers: [
                {
                    host: 'tracker.fastdfs.com',
                    port: 22122
                }
            ],
            logger: {
                log: debug
            }
        })
    })

    describe('#upload(file, options), #download(fileId, options), #del(fileId)', function() {
        it('should upload, download and delete file successfully', function(done) {
            co(function *() {
                var src = path.join(__dirname, 'test.gif')
                var fileId = yield fdfs.upload(src)
                // 验证下载的文件
                var target = path.join(__dirname, 'test_download.gif')
                yield fdfs.download(fileId, target)
                expect(isBufferEqual(fs.readFileSync(src), fs.readFileSync(target))).to.be(true)
                fs.unlinkSync(target)

                // 删除文件
                yield fdfs.del(fileId)
                // 再下载下看看是否已删除
                var error = null
                try {
                    yield fdfs.download(fileId, target)

                } catch (err) {
                    error = err
                }
                fs.unlinkSync(target)
                expect(error).to.be.an(Error)

            })(done)
        })

        it('should download by specified offset and bytes', function(done) {
            co(function *() {
                var src = path.join(__dirname, 'test.gif')
                var fileId = yield fdfs.upload(src)
                var target = path.join(__dirname, 'test_download.gif')
                var options = {
                    target: target,
                    offset: 5,
                    bytes: 5
                }
                yield fdfs.download(fileId, options)
                expect(isBufferEqual(fs.readFileSync(src).slice(options.offset, options.offset + options.bytes), fs.readFileSync(target))).to.be(true)
                fs.unlinkSync(target)

            })(done)
        })

        it('should option.ext be the uploaded file\'s ID extension', function(done) {
            co(function *() {
                var src = path.join(__dirname, 'test.gif')
                var fileId = yield fdfs.upload(src, {
                    ext: 'jpg'
                })
                expect(path.extname(fileId)).to.be('.jpg')
                yield fdfs.del(fileId)

            })(done)
        })

        it('should option.group be the uploaded file\'s group', function(done) {
            co(function *() {
                var src = path.join(__dirname, 'test.gif')
                var fileId = yield fdfs.upload(src, {
                    group: 'group1'
                })
                expect(fileId.substring(0, fileId.indexOf('/'))).to.be('group1')
                yield fdfs.del(fileId)

            })(done)
        })
    })

    describe('#setMetaData(fileId, metaData, flag), #getMetaData(fileId)', function() {
        it('meta data by set should equal to the meta data by get', function(done) {
            co(function *() {
                var src = path.join(__dirname, 'test.gif')
                var fileId = yield fdfs.upload(src)
                var metaData = {
                    meta1: 'value2',
                    meta2: 'value2'
                }
                yield fdfs.setMetaData(fileId, metaData)
                var metaDataFetched = yield fdfs.getMetaData(fileId)
                expect(metaDataFetched).to.be.eql(metaData)

                yield fdfs.del(fileId)

            })(done)
        })

        it('meta data should be overridden', function(done) {
            co(function *() {
                var src = path.join(__dirname, 'test.gif')
                var fileId = yield fdfs.upload(src)
                var metaData = {
                    meta1: 'value2',
                    meta2: 'value2'
                }
                yield fdfs.setMetaData(fileId, metaData)
                yield fdfs.setMetaData(fileId, {
                    meta3: 'value3'
                }, 'O')
                var metaDataFetched = yield fdfs.getMetaData(fileId)
                expect(metaDataFetched).to.be.eql({
                    meta3: 'value3'
                })

                yield fdfs.del(fileId)

            })(done)
        })

        it('meta data should be merged', function(done) {
            co(function *() {
                var src = path.join(__dirname, 'test.gif')
                var fileId = yield fdfs.upload(src)
                var metaData = {
                    meta1: 'value2',
                    meta2: 'value2'
                }
                yield fdfs.setMetaData(fileId, metaData)
                yield fdfs.setMetaData(fileId, {
                    meta3: 'value3'
                }, 'M')
                var metaDataFetched = yield fdfs.getMetaData(fileId)
                expect(metaDataFetched).to.be.eql({
                    meta1: 'value2',
                    meta2: 'value2',
                    meta3: 'value3'
                })

                yield fdfs.del(fileId)

            })(done)
        })
    })

    describe('#getFileInfo(fileId)', function() {
        it('should return file info', function(done) {
            co(function *() {
                var src = path.join(__dirname, 'test.gif')
                var fileId = yield fdfs.upload(src)
                var fileInfo = yield fdfs.getFileInfo(fileId)
                expect(fileInfo.size).not.to.be(undefined)
                expect(fileInfo.timestamp).not.to.be(undefined)
                expect(fileInfo.crc32).not.to.be(undefined)
                expect(fileInfo.addr).not.to.be(undefined)
                yield fdfs.del(fileId)
            })(done)
        })
    })

})