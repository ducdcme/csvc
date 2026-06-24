const express = require('express');
const router = express.Router();

const controller = require('./contractor.controller');
const auth = require('../../infrastructure/middleware/auth.middleware');

router.get('/', auth, controller.getList);

router.get('/:id', auth, controller.getById);

router.post('/', auth, controller.create);

router.put('/:id', auth, controller.update);

router.delete('/:id', auth, controller.delete);

module.exports = router;