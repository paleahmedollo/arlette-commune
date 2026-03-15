const router = require('express').Router();
const { authenticate, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/reports.controller');
const upload = require('../middlewares/upload');

// Citoyen
router.post('/',         authenticate, upload.single('photo'), ctrl.create);
router.get('/my',        authenticate, ctrl.myReports);
router.get('/:id',       authenticate, ctrl.getById);

// Agents & Admin
router.get('/',          authenticate, requireRole('agent', 'admin', 'super_admin'), ctrl.getAll);
router.put('/:id/status',authenticate, requireRole('agent', 'admin', 'super_admin'), ctrl.updateStatus);

module.exports = router;
