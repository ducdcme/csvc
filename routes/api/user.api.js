const express = require('express');
const router = express.Router();

const contractorRoutes = require('../../modules/contractor/contractor.routes');

const authRoutes = require('../../modules/auth/auth.routes');
const dashboardRoutes = require('../../modules/dashboard/dashboard.routes');
const masterDataRoutes = require('../../modules/master-data/master-data.routes');

router.use('/dashboard', dashboardRoutes);

//Auth
router.use('/', authRoutes);
//Master Data
router.use('/master-data', masterDataRoutes);
//Contractor
router.use('/contractors', contractorRoutes);
// Repair
router.use('/repairs', require('../../modules/repair/repair.routes'));

// Inspection
router.use('/inspection', require('../../modules/inspection/inspection.routes'));

// Periodic
router.use('/periodic-work', require('../../modules/periodic-work/periodic-work.routes'));

// Incident
router.use('/incident-work', require('../../modules/incident-work/incident-work.routes'));

// TEST
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: "User API OK",
        data: { user: req.user },
        pagination: null
    });
});

module.exports = router;