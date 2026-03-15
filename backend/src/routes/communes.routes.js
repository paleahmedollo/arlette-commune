const router = require('express').Router();
const ctrl = require('../controllers/communes.controller');

// Public : autocomplétion à la recherche
router.get('/search', ctrl.search);
router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getById);

module.exports = router;
