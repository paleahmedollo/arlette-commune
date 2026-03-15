const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const ctrl = require('../controllers/auth.controller');

router.post('/register',        ctrl.register);
router.post('/send-otp',        ctrl.sendOtp);
router.post('/verify-otp',      ctrl.verifyOtp);
router.post('/login',           ctrl.login);
router.get('/me',               authenticate, ctrl.me);
router.put('/profile',          authenticate, ctrl.updateProfile);
router.put('/fcm-token',        authenticate, ctrl.updateFcmToken);

module.exports = router;
