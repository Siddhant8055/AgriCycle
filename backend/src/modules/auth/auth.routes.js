const { Router } = require('express');
const { register, login, getMe } = require('./auth.controller');
const { authenticateJwt } = require('../../middlewares/auth');

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', authenticateJwt, getMe);

module.exports = router;
