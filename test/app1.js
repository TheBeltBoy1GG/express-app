const express = require('express');
const app = express();
const port = 3000;
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));       // 表单格式
app.use(cookieParser()); // 解析 Cookie 中间件

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

// app.get('/about', (req, res) => {
//   res.send('This is the about page.');
// });



// app.get('/users/:id', (req, res) => {
//     // 1?role=admin&sort=desc
//   const userId = req.params.id;
//   console.log(req.params.id);   // 输出：789（来自路径）
//   console.log(req.query.role);  // 输出：admin（来自问号后面）
//   console.log(req.query.sort);  // 输出：asc（来自问号后面）
// //   console.log(req.body);{ name: '李四', age: 30 }
//   res.send(`User ID: ${userId}`);
// });



// app.get('/search', (req, res) => {
//     const query = req.query.q;
//     // console.log(req.query); undefined
//   res.send(`Search query: ${query}`);
// });


// // req.get('字段名')：安全地获取请求头（不区分大小写），比 req.headers['xxx'] 更规范。
// app.get('/info', (req, res) => {
//   // 1. 请求头（包含 User-Agent、Cookie、Authorization 等）
//   console.log(req.headers['user-agent']); // 客户端浏览器/工具信息
//   console.log(req.get('Authorization')); // 常用于 JWT 令牌

//   // 2. 请求方法和路径
//   console.log(req.method); // GET / POST / PUT ...
//   console.log(req.path);   // /info

//   // 3. 客户端 IP 地址（注意：如果经过 Nginx 代理，需看 X-Forwarded-For）
//   console.log(req.ip);     

//   // 4. 原始 URL（包含问号后面的全部）
//   console.log(req.originalUrl); // /info?xxx=yyy

//   res.send('查看终端日志');
// });



// app.post('/users', (req, res) => {
//   // Handle user creation logic here
//   console.log(req.body.name);   // 输出：李四（来自请求体）
//   console.log(req.body.age);    // 输出：30（来自请求体）
//   res.send('User created successfully.');
// });



// app.put('/users/:id', (req, res) => {
//   const userId = req.params.id;
//   // Handle user update logic here
//   res.send(`User ID ${userId} updated successfully.`);
// });



// app.delete('/users/:id', (req, res) => {
//   const userId = req.params.id;
//   // Handle user deletion logic here
//   res.send(`User ID ${userId} deleted successfully.`);
// });

// // req.is('类型')：判断请求体的 Content-Type，常用于区分是 JSON、表单还是文件上传。
// app.post('/upload', (req, res) => {
//   if (req.is('application/json')) {
//     console.log('收到 JSON 数据');
//   } else if (req.is('multipart/form-data')) {
//     console.log('收到文件上传数据');
//   }
// });

// // 万能信息接收器（随便找个不冲突的路由，比如 /debug）
// app.all('/debug', (req, res) => {
//   console.log('========== 请求全貌 ==========');
//   console.log('请求方法:', req.method);
//   console.log('完整路径:', req.originalUrl);
//   console.log('路径:', req.path);
//   console.log('IP地址:', req.ip);

//   console.log('--- 路由参数(req.params) ---');
//   console.log(req.params); // 如果路由是 /debug/:id，这里会有值

//   console.log('--- 查询字符串(req.query) ---');
//   console.log(req.query);

//   console.log('--- 请求体(req.body) ---');
//   console.log(req.body); // 确保已配置 express.json() 或 express.urlencoded()

//   console.log('--- 请求头(req.headers) ---');
//   console.log(req.headers);

//   res.send('信息已打印到终端，请查看！');
// });

// ❌ 不推荐（语义不明确，虽然也能返回JSON）
// app.get('/user', (req, res) => {
//   res.send({ name: '张三', age: 30 });
// });

// ✅ 推荐（明确告诉调用者，这是JSON接口）
app.get('/user', (req, res) => {
    res.json({ name: '张三', age: 30 });
});

// res.status() HTTP状态码是客户端判断请求成功或失败的关键。Express支持链式调用，非常优雅

// 创建成功 - 201
app.post('/users', (req, res) => {
    // 假设数据保存成功
    res.status(201).json({ message: '用户创建成功', userId: 123 });
});

// 找不到资源 - 404
app.get('/users/:id', (req, res) => {
    const user = null; // 模拟查不到数据
    if (!user) {
        return res.status(404).json({ error: '用户不存在' });
    }
    res.status(200).json(user);
});

// 服务器内部错误 - 500
app.get('/error', (req, res) => {
    try {
        throw new Error('数据库崩溃');
    } catch (e) {
        res.status(500).json({ error: '服务器开小差了' });
    }
});

// 🔀 三、重定向：res.redirect()
app.get('/old-page', (req, res) => {
    res.redirect(301, '/user'); // 301永久重定向（SEO友好）
});

// app.post('/login', (req, res) => {
//     // 登录成功后，跳转到首页
//     res.redirect('/');
// });

// 📂 四、文件下载：res.download()
const path = require('path');

app.get('/download', (req, res) => {
    // 第一个参数：文件的实际路径
    // 第二个参数（可选）：下载时显示的文件名
    const filePath = path.join(__dirname, 'files', 'report.pdf');
    res.download(filePath, '月度报告.pdf', (err) => {
        if (err) {
            console.error('下载出错:', err);
            res.status(500).send('文件下载失败');
        }
    });
});

// 🛡️ 五、设置响应头：res.set() 与 res.append()
app.get('/protected', (req, res) => {
    // set() 会覆盖同名字段
    res.set('X-Custom-Header', 'my-secret-value');

    // append() 会追加同名字段（比如多个Set-Cookie）
    res.append('Set-Cookie', 'token=abc123; HttpOnly');

    res.json({ message: '头部设置成功' });
});

// 安全原则：每个路由处理函数中，res.xxx() 方法永远只执行一次。如果你在 if/else 里用了 res.xxx()，后面记得加 return 防止继续执行。
// GET /users/100?fields=name,age
app.get('/fucker/:id', (req, res) => {
    const userId = req.params.id;      // 从请求拿参数
    const fields = req.query.fields;   // 从请求拿查询

    // 模拟用户数据（实际开发中查数据库）
    const userData = { id: userId, name: '王五', age: 30, password: '123456' };
    console.log('返回用户数据:', userData);
    // 1. 如果没找到，返回404
    if (!userData) {
        return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    // 2. 如果请求带fields参数，做字段过滤（模拟）
    if (fields) {
        const fieldArr = fields.split(',');
        const filtered = {};
        fieldArr.forEach(key => {
            if (userData[key] !== undefined) filtered[key] = userData[key];
        });
        // 返回过滤后的数据，状态码200（默认）
        return res.status(200).json(filtered);
    }

    // 3. 默认返回全部（但注意不要返回密码！实际开发要剔除敏感字段）
    delete userData.password; // 简单去掉密码
    res.status(200).json(userData);
});

// Cookie正确的清除姿势：必须完全匹配
// // 登录时
// app.post('/login', (req, res) => {
//     res.cookie('token', 'abc123', {
//         httpOnly: true,
//         path: '/admin',
//         domain: '.example.com' // 如果有 domain，清除时也要带上
//     });
//     res.send('登录成功');
// });

// // 登出时：✅ 正确的清除方式（保持 options 一致）
// app.post('/logout', (req, res) => {
//     res.clearCookie('token', {
//         path: '/admin',
//         domain: '.example.com'
//     });
//     res.send('已登出');
// });

// 登录接口：设置 Cookie
app.post('/login', (req, res) => {
  // 假设用户名密码验证通过
  res.cookie('username', '张三', {
    maxAge: 900000,   // 有效期 15 分钟（单位：毫秒）
    httpOnly: true    // 防止前端 JS 读取（防 XSS 攻击）
  });
  res.json({ message: '登录成功', username: '张三' });
});

// 获取当前用户信息（验证 Cookie 是否存在）
app.get('/profile', (req, res) => {
  const username = req.cookies.username;
  if (!username) {
    return res.status(401).json({ error: '请先登录' });
  }
  res.json({ message: `欢迎回来，${username}` });
});

// 登出接口：清除 Cookie
app.post('/logout', (req, res) => {
  // 由于我们没设 path，默认就是 '/', 直接清空即可
  res.clearCookie('username');
  res.json({ message: '已成功登出' });
});


const userRouter = require('./routes/users');
app.use('/users-router', userRouter); // 所有 /users-router 开头的请求交给 userRouter
// 2. 全局 404 拦截（必须放在所有路由之后）
// 匹配所有未定义的路径（必须放在最底部！）
app.use('*', (req, res) => {
  res.status(404).json({ error: `路径 ${req.originalUrl} 不存在` });
});

// 错误处理中间件（也放在最后）
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});