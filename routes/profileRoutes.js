const express = require('express');
const { verifyToken } = require('../routes/auth'); // Asegúrate de que la ruta a auth.js sea correcta
const router = express.Router();

router.get('/profile', verifyToken, (req, res) => {
    res.render('profile', { user: req.user });
});

module.exports = router;
