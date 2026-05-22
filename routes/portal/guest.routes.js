const express = require('express');
const router = express.Router();

// Campus select
router.get('/campus', (req, res) => {
    res.render('portals/guest/campus', {
        layout: 'layouts/public',
        title: 'Hãy chọn cơ sở bạn đang làm việc'
    });
});

// Report page
router.get('/repair', (req, res) => {
    if (!req.session.campus_id) {
        return res.redirect('/guest/campus');
    }
    res.render('portals/guest/repair', {
        layout: 'layouts/public',
        title: 'Báo hỏng cơ sở vật chất'
    });
});

// Login page
router.get('/login', (req, res) => {
    res.render('portals/guest/login', {
        layout: 'layouts/public',
        title: 'Đăng nhập'
    });
});

module.exports = router;