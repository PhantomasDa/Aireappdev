const express = require('express');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.get('/profile', verifyToken, (req, res) => {
    res.render('profile', { user: req.user });
});

module.exports = router;
