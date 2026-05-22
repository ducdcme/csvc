const cron = require('node-cron');
const { generatePeriodicJobs } = require('../modules/periodic-work/cron/cron.service');

/**
 * Chạy mỗi ngày 00:05
 */
cron.schedule('5 0 * * *', async () => {
    console.log('=== START CRON ===');

    try {
        await generatePeriodicJobs();
    } catch (err) {
        console.error(err);
    }

    console.log('=== END CRON ===');
});