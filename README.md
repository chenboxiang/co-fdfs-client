> 很抱歉，此项目已停止维护！

# fdfs-client wrapper for co
此模块为[fdfs-client](https://github.com/chenboxiang/fdfs-client)模块的配合co使用的版本。

# 安装
```shell
npm install co-fdfs-client
```

# 使用
详细用法请参考[fdfs-client](https://github.com/chenboxiang/fdfs-client)

```js
var fs = require('fs')
var FdfsClient = require('co-fdfs-client')
var fdfs = FdfsClient({
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

co(function *() {
    // 上传
    var src = path.join(__dirname, 'test.gif')
    var fileId = yield fdfs.upload(src)
    // 下载
    var target = path.join(__dirname, 'test_download.gif')
    yield fdfs.download(fileId, target)
    fs.unlinkSync(target)
    // 删除
    yield fdfs.del(fileId)
})(function(err) {

})
```

# 测试

测试前请确保配置好FastDFS的Server地址，为tracker.fastdfs.com:22122，或者修改test/fdfs_test.js中的client配置，然后执行如下命令：
```shell
make test
```

# 帮助
有任何问题请提交到Github Issue里

# 授权协议
MIT
