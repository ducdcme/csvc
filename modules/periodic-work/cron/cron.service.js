/**
 * Service: xử lý toàn bộ logic cron
 */

const repo = require('./cron.repo');

/**
 * Convert Date → YYYY-MM-DD (tránh lỗi timezone)
 */
function toDateString(date) {
    return new Date(date).toISOString().slice(0, 10);
}

/**
 * Tính số ngày giữa 2 mốc
 */
function diffInDays(d1, d2) {
    const t1 = new Date(d1).getTime();
    const t2 = new Date(d2).getTime();
    return Math.floor((t1 - t2) / (1000 * 60 * 60 * 24));
}

/**
 * Tính số tháng giữa 2 mốc
 */
function diffInMonths(d1, d2) {
    const date1 = new Date(d1);
    const date2 = new Date(d2);

    return (
        (date1.getFullYear() - date2.getFullYear()) * 12 +
        (date1.getMonth() - date2.getMonth())
    );
}

/**
 * Check có đúng chu kỳ hôm nay không
 */
function isDueToday(def, todayStr) {
    const today = new Date(todayStr);
    const first = new Date(def.first_due_date);

    if (today < first) return false;

    const unit = def.cycle_unit;
    const value = def.cycle_value;

    if (unit === 'DAY') {
        const diff = diffInDays(today, first);
        return diff % value === 0;
    }

    if (unit === 'WEEK') {
        const diff = diffInDays(today, first);
        return diff % (7 * value) === 0;
    }

    if (unit === 'MONTH') {
        const diff = diffInMonths(today, first);
        return diff % value === 0 &&
            today.getDate() === first.getDate(); // tránh lệch ngày
    }

    if (unit === 'YEAR') {
        const diff = today.getFullYear() - first.getFullYear();
        return diff % value === 0 &&
            today.getMonth() === first.getMonth() &&
            today.getDate() === first.getDate();
    }

    return false;
}

/**
 * Check nằm trong active range
 */
function isInActiveRange(def, todayStr) {
    const today = new Date(todayStr);

    if (def.active_from && today < new Date(def.active_from)) return false;
    if (def.active_to && today > new Date(def.active_to)) return false;

    return true;
}

/**
 * MAIN CRON FUNCTION
 */
async function generatePeriodicJobs() {
    const todayStr = toDateString(new Date());

    console.log('Cron running at:', todayStr);

    const definitions = await repo.getActiveDefinitions();

    for (const def of definitions) {
        try {
            // 1. check active range
            if (!isInActiveRange(def, todayStr)) continue;

            // 2. check chu kỳ
            if (!isDueToday(def, todayStr)) continue;

            // 3. tạo job (DB sẽ chặn duplicate)
            await repo.createJob({
                definition_id: def.id,
                campus_id: def.campus_id,
                due_date: todayStr,
                title: def.title,
            });

            console.log(`Created job for definition ${def.id}`);
        } catch (err) {
            // duplicate key → bỏ qua
            if (err.code === '23505') {
                console.log(`Duplicate skipped for definition ${def.id}`);
                continue;
            }

            console.error('Cron error:', err);
        }
    }

    console.log('Cron done');
}

module.exports = {
    generatePeriodicJobs,
};