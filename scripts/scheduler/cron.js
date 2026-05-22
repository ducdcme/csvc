const cron = require('node-cron');
const inspectionRepository = require('../../modules/inspection/inspection.repository');

cron.schedule('58 23 * * *', async () => {
    console.log('Run overdue job');
    await inspectionRepository.markOverdue();
});