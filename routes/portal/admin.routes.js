const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
    res.render('portals/manager/dashboard', {
        layout: 'layouts/adminportal',
        title: 'Dashboard'
    });
});
router.get('/summer-work', (req, res) => {
    res.render('portals/tech/summer-work/index', {
        layout: 'layouts/adminportal',
        title: 'Công việc hè'
    })
})

router.get('/files', (req, res) => {
    res.render('portals/manager/files/files', {
        layout: 'layouts/adminportal',
        title: 'File Manager'
    });
});

// Admin Master Data
router.get('/master-data/buildings', (req, res) => {
    res.render('portals/manager/master-data/buildings', {
        layout: 'layouts/adminportal',
        title: 'Buildings Manager'
    });
});

router.get('/master-data/floors', (req, res) => {
    res.render('portals/manager/master-data/floors', {
        layout: 'layouts/adminportal',
        title: 'Floors Manager'
    });
});
router.get('/master-data/rooms', (req, res) => {
    res.render('portals/manager/master-data/rooms', {
        layout: 'layouts/adminportal',
        title: 'Rooms Manager'
    });
});

router.get('/master-data/room-types', (req, res) => {
    res.render('portals/manager/master-data/room-types', {
        layout: 'layouts/adminportal',
        title: 'Room Types Manager'
    });
});

router.get('/master-data/asset-types', (req, res) => {
    res.render('portals/manager/master-data/asset-types', {
        layout: 'layouts/adminportal',
        title: 'Asset Types Manager'
    });
});


router.get('/master-data/room-type-assets', (req, res) => {
    res.render('portals/manager/master-data/room-type-assets', {
        layout: 'layouts/adminportal',
        title: 'Room Type Assets Manager'
    });
});
router.get('/master-data/room-names', (req, res) => {
    res.render('portals/manager/master-data/room-names', {
        layout: 'layouts/adminportal',
        title: 'Room Names Manager'
    });
});
//User
router.get('/users', (req, res) => {
    res.render('portals/manager/users/users', {
        layout: 'layouts/adminportal',
        title: 'Users Manager'
    });
});
//Permissions
router.get('/permissions', (req, res) => {
    res.render('portals/manager/permissions/permissions', {
        layout: 'layouts/adminportal',
        title: 'Permissions Manager'
    });
});
//Role
router.get('/roles', (req, res) => {
    res.render('portals/manager/role/roles', {
        layout: 'layouts/adminportal',
        title: 'Roles Manager'
    });
});
//Admin Periodic Work
router.get('/periodic-work/definitions', (req, res) => {
    res.render('portals/manager/periodic-work/definitions', {
        layout: 'layouts/adminportal',
        title: 'Periodic Definitions'
    })
})
router.get('/periodic-work/generate', (req, res) => {
    res.render('portals/manager/periodic-work/generate', {
        layout: 'layouts/adminportal',
        title: 'Generate Periodic Jobs'
    })
})
router.get('/periodic-work/jobs', (req, res) => {
    res.render('portals/manager/periodic-work/jobs', {
        layout: 'layouts/adminportal',
        title: 'Periodic Jobs'
    })
})
router.get('/periodic-work/jobs/:id', (req, res) => {
    res.render('portals/manager/periodic-work/job-detail', {
        layout: 'layouts/adminportal',
        title: 'Periodic Job Detail'
    })
})
router.get('/periodic-work/jobs/:id/assign', (req, res) => {
    res.render('portals/manager/periodic-work/job-rooms', {
        layout: 'layouts/adminportal',
        title: 'Manage Job Rooms'
    })
})
// Admin Incident Work Form

// ===== INCIDENT WORK =====
router.get('/incident-work', (req, res) => {
    res.render('portals/manager/incident-work/list', {
        layout: 'layouts/adminportal',
        title: 'Danh sách công việc'
    });
});
router.get('/incident-work/create', (req, res) => {
    res.render('portals/manager/incident-work/create', {
        layout: 'layouts/adminportal',
        title: 'Tạo công việc mới'
    });
});
router.get('/incident-work/:id/edit', (req, res) => {
    res.render('portals/manager/incident-work/edit', {
        layout: 'layouts/adminportal',
        title: 'Chỉnh sửa công việc'
    });
});
router.get('/incident-work/:id', (req, res) => {
    res.render('portals/manager/incident-work/detail', {
        layout: 'layouts/adminportal',
        title: 'Chi tiết công việc'
    });
});


// ===== CONTRACTOR =====
router.get('/contractors', (req, res) => {
    res.render('portals/manager/contractors/list', {
        layout: 'layouts/adminportal',
        title: 'Danh sách nhà thầu'
    });
});

router.get('/contractors/create', (req, res) => {
    res.render('portals/manager/contractors/form', {
        layout: 'layouts/adminportal',
        title: 'Thêm nhà thầu mới'
    });
});

/**
 * Import from Locations Excell
 */
router.get('/import/locations', (req, res) => {
    res.render('portals/manager/import/locations', {
        layout: 'layouts/adminportal',
        title: 'Import'
    });
});
router.get('/import/room-names', (req, res) => {
    res.render('portals/manager/import/room-name-import', {
        layout: 'layouts/adminportal',
        title: 'Import Room Names'
    });
});
module.exports = router;