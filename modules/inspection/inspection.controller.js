const inspectionService = require('./inspection.service');
const db = require('../../infrastructure/database/connection');

module.exports = {

    // 1. Get checklist by zone
    async getChecklistByZone(req, res) {
        try {
            const campus_id = req.session.campus_id;
            const { zone_id } = req.query;

            const data = await inspectionService.getChecklistByZone(campus_id, zone_id);

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getInspectionByDate(req, res) {
        try {
            const campus_id = req.session.campus_id;
            const { zone_id, date } = req.query;

            const data = await inspectionService.getInspectionByDate(
                campus_id,
                zone_id,
                date
            );

            res.json({ success: true, data });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // POST create
    async createInspection(req, res) {
        try {
            const campus_id = req.session.campus_id;

            const { zone_id, date } = req.body;

            const data = await inspectionService.createInspection(
                campus_id,
                zone_id,
                date
            );

            res.json({ success: true, data });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    },
    // 3. Get inspection detail
    async getInspectionDetail(req, res) {
        try {
            const { id } = req.params;

            const data = await inspectionService.getInspectionDetail(id);

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4. Save result
    async saveInspectionResult(req, res) {
        try {
            const { inspection_id, item_id, is_ok, issue_note } = req.body;

            const result = await inspectionService.saveInspectionResult(
                inspection_id,
                item_id,
                is_ok,
                issue_note
            );

            res.json({
                success: true,
                message: 'Saved',
                data: {
                    result_id: result.id   // 👈 QUAN TRỌNG
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 5. Upload attachment
    async uploadAttachment(req, res) {
        const client = await db.connect();

        try {
            const campus_id = req.session.campus_id;
            const user_id = req.session?.user?.id || null;

            const { result_id, attachment_type } = req.body;

            if (!result_id || !attachment_type) {
                return res.status(400).json({
                    success: false,
                    message: 'result_id and attachment_type are required'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'file is required'
                });
            }

            await client.query('BEGIN');

            const file = await inspectionService.uploadAttachment(
                client,
                {
                    campus_id,
                    user_id
                },
                result_id,
                attachment_type,
                req.file
            );

            await client.query('COMMIT');

            res.json({
                success: true,
                data: file
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(error);

            res.status(500).json({
                success: false,
                message: error.message
            });
        } finally {
            client.release();
        }
    },

    // 6. Submit inspection
    async submitInspection(req, res) {

        const client = await db.connect();

        try {

            const { inspection_id, note, late_reason } = req.body;
            const user_id = req.user.id;

            await client.query('BEGIN');

            await inspectionService.submitInspection(
                client,
                inspection_id,
                user_id,
                note,
                late_reason
            );

            await client.query('COMMIT');

            res.json({
                success: true
            });

        } catch (err) {

            await client.query('ROLLBACK');
            console.error(err);

            res.status(500).json({
                success: false,
                message: err.message
            });

        } finally {
            client.release();
        }
    },



    // 8. Monthly report
    async getMonthlyReport(req, res) {
        try {
            const campus_id = req.session.campus_id;
            const { month, year } = req.query;

            const data = await inspectionService.getMonthlyReport(campus_id, month, year);

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false });
        }
    },

    // 9. Fault detail
    async getFaultDetail(req, res) {
        try {
            const { inspection_id } = req.params;

            const data = await inspectionService.getFaultDetail(inspection_id);

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false });
        }
    },
    // 1. Zones
    async getZones(req, res) {
        try {
            const campus_id = req.session.campus_id;

            const data = await inspectionService.getZones(campus_id);

            res.json({ success: true, data });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false });
        }
    },

    // 2. History
    async getHistory(req, res) {
        try {
            const campus_id = req.session.campus_id;
            const { from_date, to_date, zone_id, status } = req.query;

            const data = await inspectionService.getHistory(
                campus_id,
                from_date,
                to_date,
                zone_id,
                status
            );

            res.json({ success: true, data });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false });
        }
    },

    // 3. Zones status today
    async getZonesStatusToday(req, res) {
        try {
            const campus_id = req.user.campus_id;
            const data = await inspectionService.getZonesStatusToday(campus_id);

            res.json({ success: true, data });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                success: false,
                message: e.message,
            });
        }
    },

    // 4. Dashboard summary
    async getDashboardSummary(req, res) {
        try {
            const campus_id = req.session.campus_id;

            const data = await inspectionService.getDashboardSummary(campus_id);

            res.json({ success: true, data });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false });
        }
    },
    async getTodayInspections(req, res) {

        const client = await db.connect();

        try {

            const campus_id = req.user.campus_id;

            const data = await inspectionService.getTodayInspections(client, campus_id);

            res.json({
                success: true,
                data
            });

        } catch (err) {
            console.error(err);

            res.status(500).json({
                success: false,
                message: err.message
            });

        } finally {
            client.release();
        }
    },
    async validateInspection(req, res) {
        try {
            const inspection_id = req.params.id;
            const zone_id = req.query.zone_id;

            const result = await inspectionService.validateInspection(inspection_id, zone_id);

            res.json({
                success: true,
                data: result
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    },
    async getFilesByResult(req, res) {
        try {
            const { result_id } = req.params;

            const data = await inspectionService.getFilesByResult(result_id);

            res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    // GET overdue
    async getOverdue(req, res) {

        const client = await db.connect();

        try {
            const campus_id = req.user.campus_id;

            const data = await inspectionService.getOverdue(client, campus_id);

            res.json({ success: true, data });

        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        } finally {
            client.release();
        }
    },

    // POST reopen
    async reopen(req, res) {
        const { id } = req.params;

        await inspectionService.reopenInspection(id);

        res.json({ success: true });
    },

    async attachFile(req, res) {

        const client = await db.connect();

        try {

            const { result_id, file_id } = req.body;

            await client.query('BEGIN');

            await inspectionRepository.attachFiles(client, result_id, file_id);

            await client.query('COMMIT');

            res.json({ success: true });

        } catch (err) {
            await client.query('ROLLBACK');
            res.status(500).json({ success: false, message: err.message });
        } finally {
            client.release();
        }
    },
    async saveItem(req, res) {

        const client = await db.connect();

        try {

            const { inspection_id, item_id, is_ok, issue_note, file_ids } = req.body;

            await client.query('BEGIN');

            const result = await inspectionService.saveItem(
                client,
                inspection_id,
                item_id,
                is_ok,
                issue_note,
                file_ids
            );

            await client.query('COMMIT');

            res.json({
                success: true,
                data: {
                    result_id: result.id
                }
            });

        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);

            res.status(500).json({
                success: false,
                message: err.message
            });

        } finally {
            client.release();
        }
    },
    async getRecentCompleted(req, res) {

        const client = await db.connect();

        try {
            const campus_id = req.user.campus_id;

            const data = await inspectionService.getRecentCompleted(client, campus_id);

            res.json({ success: true, data });

        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        } finally {
            client.release();
        }
    }
};
