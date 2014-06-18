/**
 * Author: chenboxiang
 * Date: 14-6-19
 * Time: 上午12:13
 */
'use strict';

var FdfsClient = require('fdfs-client')
var thunkify = require('thunkify-wrap')

var methods = 'upload download del remove setMetaData getMetaData getFileInfo'.split(' ')

module.exports = function(config) {
    var fdfs = new FdfsClient(config)
    thunkify(fdfs, fdfs, methods)

    return fdfs
}