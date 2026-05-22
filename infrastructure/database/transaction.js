const pool = require('./connection');

exports.begin = async () => {
    const client = await pool.connect();
    await client.query('BEGIN');
    return client;
};

exports.commit = async (client) => {
    await client.query('COMMIT');
    client.release();
};

exports.rollback = async (client) => {
    await client.query('ROLLBACK');
    client.release();
};