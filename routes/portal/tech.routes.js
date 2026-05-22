// routes/tech.routes.js

const express = require('express')
const router = express.Router()
const portalPermission = require('../../infrastructure/middleware/portalPermission.middleware');

router.get('/dashboard', (req, res) => {
    res.render('portals/tech/dashboard', {
        layout: 'layouts/portal',
        title: 'Tổng quan'
    })
})
router.get('/summer-work', (req, res) => {
    res.render('portals/tech/summer-work/index', {
        layout: 'layouts/portal',
        title: 'Công việc hè'
    })
})
router.get('/repairs', (req, res) => {
    res.render('portals/tech/repair/index', {
        layout: 'layouts/portal',
        title: 'Sửa chữa'
    })
})
router.get('/repairs/create', (req, res) => {
    res.render('portals/tech/repair/repairs-create', {
        layout: 'layouts/portal',
        title: 'Báo hỏng CSVC'
    })
})
// cũ
router.get('/inspection', (req, res) => {
    res.render('portals/tech/inspection/index', {
        layout: 'layouts/portal',
        title: 'Ngăn ngừa rủi ro'
    })
})
router.get('/inspection/form', (req, res) => {
    res.render('portals/tech/inspection/form', {
        layout: 'layouts/portal',
        title: 'Báo cáo NNRR HTKT'
    })
})
router.get('/changepw', (req, res) => {
    res.render('portals/user/changepw', {
        layout: 'layouts/portal',
        title: 'Thay đổi mật khẩu'
    })
})
router.get('/periodic-work', (req, res) => {
    res.render('portals/tech/periodic/index', {
        layout: 'layouts/portal',
        title: 'Công việc định kỳ'
    })
});
router.get('/periodic-work/:id/submit-operation', (req, res) => {
    res.render('portals/tech/periodic/operation-submit', {
        layout: 'layouts/portal',
        title: 'Báo cáo vận hành định kỳ'
    });
});

router.get('/periodic-work/:id/submit-maintenance', (req, res) => {
    res.render('portals/tech/periodic/maintenance-submit', {
        layout: 'layouts/portal',
        title: 'Báo cáo bảo trì định kỳ'
    });
});
router.get('/periodic-work/:id/rooms', (req, res) => {
    res.render('portals/tech/periodic/job-room-detail', {
        layout: 'layouts/portal',
        title: 'Kiểm tra theo phòng'
    });
});
router.get('/periodic-work/monthly', (req, res) => {
    res.render('portals/tech/periodic/monthly', {
        layout: 'layouts/portal',
        title: 'Checklist tháng'
    });
});
router.get('/incident-work', (req, res) => {
    res.render('portals/tech/incident-work/list', {
        layout: 'layouts/portal',
        title: 'Danh sách phát sinh'
    });
});
router.get('/incident-work/create', portalPermission('incident.create'), (req, res) => {

    res.render(
        'portals/tech/incident-work/create',
        {
            layout: 'layouts/portal',
            title: 'Tạo công việc mới'
        }
    );
});
router.get('/incident-work/:id', (req, res) => {
    res.render('portals/tech/incident-work/detail', {
        layout: 'layouts/portal',
        title: 'Chi tiết phát sinh'
    });
});



module.exports = router