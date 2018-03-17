const express = require('express');
const router = express.Router();

/* api 测试 */
router.get('/', (req, res) => {
  res.json({
    message: 'This is a API route line',
  });
});

router.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    res.json(users);
  });
});

module.exports = router;
