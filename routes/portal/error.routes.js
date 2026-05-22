const express = require('express');
const router = express.Router();

router.get('/403', (req, res) => {
    res.render('errors/403', {
        layout: false,
        title: 'Error',
        error: {
            message: 'Access denied',
            requiredPermissions: req.session.permissionError?.requiredPermissions
        }
    });
});

module.exports = router