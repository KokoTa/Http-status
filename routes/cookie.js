var express = require('express');
var router = express.Router();

/* cookie 测试 */
router.get('/', function(req, res, next) {
  // cookie中是否存在test
  if (!req.cookies.test) {
    res.cookie('test', 'xxx', {
      maxAge: 10000,
      signed: true, // 我要加密内容
    });
  }
  
  res.json({
    cookie: req.cookies,
    signedCookies: req.signedCookies, // 注意第一次访问的时候是没有值的，因为这次的req还没赋值啊
  });
});

module.exports = router;
