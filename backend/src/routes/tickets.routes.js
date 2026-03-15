const router = require('express').Router();
const { authenticate, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/tickets.controller');

// Citoyen : voir son ticket + envoyer message
router.get('/my',             authenticate, ctrl.myTickets);
router.get('/:id',            authenticate, ctrl.getById);
router.post('/:id/messages',  authenticate, ctrl.sendMessage);
router.get('/:id/messages',   authenticate, ctrl.getMessages);

// Agents & Admin
router.get('/',               authenticate, requireRole('agent', 'admin', 'super_admin'), ctrl.getAll);
router.put('/:id/status',     authenticate, requireRole('agent', 'admin', 'super_admin'), ctrl.updateStatus);
router.put('/:id/priority',   authenticate, requireRole('agent', 'admin', 'super_admin'), ctrl.updatePriority);

module.exports = router;
