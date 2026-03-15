const router = require('express').Router();
const { authenticate, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/structures.controller');

router.get('/',      ctrl.getAll);
router.get('/:id',   ctrl.getById);

// Admin seulement
router.post('/',     authenticate, requireRole('super_admin', 'admin'), ctrl.create);
router.put('/:id',   authenticate, requireRole('super_admin', 'admin'), ctrl.update);
router.delete('/:id',authenticate, requireRole('super_admin'), ctrl.remove);

module.exports = router;
