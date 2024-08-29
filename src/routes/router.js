const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if (req.session && req.session.user) {
    res.send({
      sessionUser: req.session.user
    });
  } else {
    res.status(401).send({
      message: 'Unauthorized'
    });
  }
});

module.exports = router;
