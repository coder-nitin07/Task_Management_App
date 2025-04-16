const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdminOrManager = require('../middleware/roleMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/getProfile/:id', authMiddleware, getProfile);
router.put('/updateProfile/:id', authMiddleware, updateProfile);

module.exports = router;