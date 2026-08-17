查询列表	GET / users	获取所有用户
查询单个	GET / users / 123	获取 ID 为 123 的用户
创建	    POST / users	新增一个用户
全量更新	PUT / users / 123	替换 ID 为 123 的用户
部分更新	PATCH / users / 123	修改 ID 为 123 的用户的部分字段
删除	    DELETE / users / 123	删除 ID 为 123 的用户
关键约定：URL 使用复数名词（/users 而不是 /user），统一小写，多个单词用连字符（/order-items）。


中间件	用途	安装命令
cors	处理跨域资源共享	npm i cors
helmet	设置安全 HTTP 头（防 XSS、点击劫持等）	npm i helmet
morgan	HTTP 请求日志（你刚实现的）	npm i morgan
compression	Gzip 压缩响应体（减少传输量）	npm i compression
express-rate-limit	IP 限流（防暴力破解）	npm i express-rate-limit
multer	处理 multipart/form-data 文件上传	npm i multer
express-session	服务端 Session 管理	npm i express-session