var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// session的依赖
const expressSession = require('express-session');

// 引入jwt
const jwt = require('jsonwebtoken');
// 引入配置文件
const config = require('./config');
// 引入用户模型
const User = require('./app/models/user');
// 连接数据库
const mongoose = require('mongoose');
mongoose.connect(config.database);


// 指向不同测试页
const index = require('./routes/cookie');
const session = require('./routes/session');
const api = require('./routes/api');


// express初始化
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// 设置加密字段
app.set('secret', config.secret);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// 这里设置加密用的字符，赋值cookie时添加signed:true即可加密这个cookie，值在signedCookies中取到
// 注意如果session的secret和这个字符相同，则这个session也是在signedCookies中取到
app.use(cookieParser('KokoTa')); 
app.use(express.static(path.join(__dirname, 'public')));


// 设置session
app.use(expressSession({
  secret: 'KokoTa', // 加密用的字符
  name: 'session_test', // session名字
  cookie: { maxAge: 10000, httpOnly: true }, // session在cookie中的有效时间，不让前端操作session
  resave: false, // 1000ms内访问session都不会变，选了true会使每次访问都变，一般都选false
  saveUninitialized: true, // 是否放在cookie里，且如果设置为false，resave则强制为true
}));

// 设置路由
// ************************************
app.use('/cookie', index); // 在此路由中设置cookie键值
app.use('/session', session); // 由于我们在app.js中设置了session，所以任何路由下都会有session，此路由用来区别/cookie路由
// ************************************
app.get('/createUser', (req, res) => { // 通过路由创建一个用户，注意这里的数据应该加密，但因为是测试token，所以懒得加密了
  const user = new User({
    name: '小猪佩奇',
    password: '123456789',
    admin: true,
  });
  user.save((err) => {
    if (err) throw err;
    console.log('save ok');
    res.json({
      success: true,
      name: user.name,
    })
  })
});
// ************************************
app.post('/getToken', (req, res) => { // 获取token
  User.findOne(
    {
      name: req.body.name,
    },
    (err, user) => {
      if (err) throw err;
      if (!user) {
        res.json({
          success: false,
          message: 'Authenticate failed. User not found',
        });
      } else {
        if (user.password != req.body.password) {
          res.json({
            success: false,
            message: 'Authenticate failed. Wrong password',
          });
        } else {
          const token = jwt.sign(user.toJSON(), app.get('secret'), { // 这里不应该把user放进去，应该遵守jwt规范，这里偷懒了
            expiresIn: 10 * 60 * 1000, // 过期时间为10分钟
          });
          res.json({
            success: true,
            message: 'Enjoy your token',
            token: token,
            cookie: req.cookies,
            signedCookie: req.signedCookies,
          });
        }
      }
    },
  );
});
app.use((req, res, next) => { // 想访问下面的路由？先给我验证token！(中间件的放置顺序很重要)
  // console.log(req.body.token);
  // console.log(req.query.token);
  // console.log(req.headers['x-access-token']);
  const token =
    req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, app.get('secret'), (err, decoded) => {
      if (err) {
        res.json({
          success: false,
          message: 'Bad token',
        });
      } else {
        next();
      }
    });
  } else {
    res.status(403).json({
      success: false,
      message: 'No token',
    });
  }
});
// ************************************
app.use('/api', api);


// 错误处理，当没有匹配的路由时会执行下面这个中间件
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(3000, () => console.log('Server Ready'));