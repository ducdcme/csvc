const db = require('../../infrastructure/database/connection');

async function testDB() {
    try {
        const users = await db.query('SELECT * FROM users LIMIT 5');
        console.log(users.rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

testDB();