const inspectionRepository = require('./inspection.repository');
const uploadService = require('../../infrastructure/upload/upload.service');
const { FILE_MODULE } = require('../../infrastructure/upload/file.constants');
const { mapAttachmentType } = require('../../infrastructure/upload/attachment.mapper');
const SYSTEM_START_DATE = '2026-04-01';

module.exports = {

    // Load checklist theo zone
    async getChecklistByZone(campus_id, zone_id) {
        return await inspectionRepository.getChecklistByZone(campus_id, zone_id);
    },



    // 1. get by date
    async getInspectionByDate(campus_id, zone_id, date) {
        return await inspectionRepository.getInspectionByDate(
            campus_id,
            zone_id,
            date
        );
    },

    // 2. create (manual)
    async createInspection(campus_id, zone_id, date) {

        const existing = await inspectionRepository.getInspectionByDate(
            campus_id,
            zone_id,
            date
        );

        if (existing) {
            return existing; // không tạo mới
        }

        return await inspectionRepository.createInspection(
            campus_id,
            zone_id,
            date
        );
    },

    // 3. overdue list
    async getOverdue(client, campus_id) {
        return await inspectionRepository.getOverdue(client, campus_id);
    },

    // 4. cron
    async runOverdueJob() {
        await inspectionRepository.markOverdue(SYSTEM_START_DATE);
    },

    // Detail
    async getInspectionDetail(inspection_id) {
        return await inspectionRepository.getInspectionDetail(inspection_id);
    },
    // Save result
    async saveInspectionResult(inspection_id, item_id, is_ok, issue_note) {
        if (is_ok === false && (!issue_note || issue_note.trim() === '')) {
            throw new Error('Issue note is required when fault');
        }

        const { rows } = await inspectionRepository.saveInspectionResult(
            inspection_id,
            item_id,
            is_ok,
            issue_note
        );
        return rows[0];
    },

    // Upload attachment
    async uploadAttachment(client, context, result_id, attachment_type, file) {

        // 1. CHECK result tồn tại
        const result = await inspectionRepository.getResultById(client, result_id);

        if (!result) {
            throw new Error('Inspection result not found');
        }

        if (Number(result.campus_id) !== Number(context.campus_id)) {
            throw new Error('Forbidden result ở chỗ này');
        }

        // 2. MAP attachment_type → file_category
        const file_category = mapAttachmentType(attachment_type);

        // 3. SAVE FILE (files table)
        const savedFile = await uploadService.saveFile(
            client,
            context,
            file,
            FILE_MODULE.INSPECTION,
            file_category
        );

        // 4. INSERT attachment (giữ schema cũ)
        await inspectionRepository.insertAttachment(
            client,
            result_id,
            savedFile.id
        );

        return {
            file_id: savedFile.id
        };
    },

    // Submit inspection
    async submitInspection(client, inspection_id, user_id, note, late_reason) {

        // 🔥 check time
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 23 || hour < 8) {
            if (!late_reason) {
                throw new Error('Late submit requires reason');
            }
        }

        await inspectionRepository.submitInspection(
            client,
            inspection_id,
            user_id,
            note,
            late_reason
        );

        await inspectionRepository.updateFilesToAttached(
            client,
            inspection_id
        );
    },


    // Monthly report
    async getMonthlyReport(campus_id, month, year) {
        return await inspectionRepository.getMonthlyReport(campus_id, month, year);
    },

    // Fault detail
    async getFaultDetail(inspection_id) {
        return await inspectionRepository.getFaultDetail(inspection_id);
    },
    // Zones
    async getZones(campus_id) {
        return await inspectionRepository.getZones(campus_id);
    },

    // History
    async getHistory(campus_id, from_date, to_date, zone_id, status) {
        return await inspectionRepository.getHistory(
            campus_id,
            from_date,
            to_date,
            zone_id,
            status
        );
    },

    // Zones status today
    async getZonesStatusToday(campus_id) {
        return await inspectionRepository.getZonesStatusToday(campus_id);
    },

    // Dashboard summary
    async getDashboardSummary(campus_id) {
        return await inspectionRepository.getDashboardSummary(campus_id);
    },
    async getDashboard(client, campus_id) {

        const rows = await inspectionRepository.getDashboard(client, campus_id);

        const result = {
            today: [],
            recent: [],
            overdue: []
        };

        rows.forEach(r => {
            if (r.type === 'today') result.today.push(r);
            if (r.type === 'recent') result.recent.push(r);
            if (r.type === 'overdue') result.overdue.push(r);
        });

        return result;
    },
    //vALIDATE
    async validateInspection(inspection_id, zone_id) {
        const rows = await inspectionRepository.validateInspection(inspection_id, zone_id);

        const errors = [];

        for (let r of rows) {

            if (!r.result_id) {
                errors.push({ item_id: r.item_id, error: 'missing_result' });
                continue;
            }

            if (Number(r.attachment_count) === 0) {
                errors.push({ item_id: r.item_id, error: 'missing_image' });
            }

            if (r.is_ok === false && !r.issue_note) {
                errors.push({ item_id: r.item_id, error: 'missing_note' });
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },
    async getFilesByResult(result_id) {
        return await inspectionRepository.getFilesByResultId(result_id);
    },
    async reopenInspection(id) {
        return await inspectionRepository.reopenInspection(id);
    },
    async saveItem(client, inspection_id, item_id, is_ok, issue_note, file_ids) {

        const result = await inspectionRepository.upsertResult(
            client,
            inspection_id,
            item_id,
            is_ok,
            issue_note
        );

        if (file_ids && file_ids.length) {
            await inspectionRepository.replaceFilesForResult(
                client,
                result.id,
                file_ids
            );
        }

        return result;
    },
    async getTodayInspections(client, campus_id) {

        const rows = await inspectionRepository.getTodayInspections(client, campus_id);

        return rows;
    },
    async getRecentCompleted(client, campus_id) {
        return await inspectionRepository.getRecentCompleted(client, campus_id);
    }
};
