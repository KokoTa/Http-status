var express = require('express');
var router = express.Router();

/* Session 测试 */
router.get('/', function (req, res, next) {
  res.json({
    cookie: req.cookies,
    signedCookies: req.signedCookies, // 注意第一次访问的时候是没有值的，因为这次的req还没赋值啊
  });
});

module.exports = router;
