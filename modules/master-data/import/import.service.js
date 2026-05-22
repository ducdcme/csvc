/**
 * IMPORT SERVICE (REFactored)
 * - Dùng excel utils (readExcel)
 * - Clean flow
 * - Transaction + Upsert
 */

const pool = require('../../../infrastructure/database/connection');
const { readExcel } = require('../../../infrastructure/utils/excel');
const XLSX = require('xlsx');

/**
 * Normalize value
 */
function normalize(value) {
    if (!value) return null;
    return String(value).trim();
}

//////////////////////////////////////////////////////
// PREVIEW (VALIDATE ONLY)
//////////////////////////////////////////////////////

exports.previewLocations = async (filePath) => {
    const rows = readExcel(filePath);

    const errors = [];
    const seen = new Set();
    const previewRows = [];

    rows.forEach((rawRow, index) => {
        const rowIndex = index + 1;

        const row = {
            row_number: rowIndex,
            campus_code: normalize(rawRow.campus_code),
            building_code: normalize(rawRow.building_code),
            floor_code: normalize(rawRow.floor_code),
            room_code: normalize(rawRow.room_code),
            room_type_code: normalize(rawRow.room_type_code),
            errors: [],
        };

        // ===== VALIDATION =====
        if (!row.campus_code) row.errors.push('Missing campus_code');
        if (!row.building_code) row.errors.push('Missing building_code');
        if (!row.floor_code) row.errors.push('Missing floor_code');
        if (!row.room_code) row.errors.push('Missing room_code');

        // duplicate trong file
        const key = `${row.campus_code}_${row.building_code}_${row.floor_code}_${row.room_code}`;
        if (seen.has(key)) {
            row.errors.push('Duplicate room');
        }
        seen.add(key);

        if (row.errors.length > 0) {
            errors.push({
                row: rowIndex,
                message: row.errors.join(', '),
            });
        }

        previewRows.push(row);
    });

    return {
        total: rows.length,
        valid: rows.length - errors.length,
        errors,
        rows: previewRows.slice(0, 250), // limit preview
    };
};

//////////////////////////////////////////////////////
// IMPORT (TRANSACTION + UPSERT)
//////////////////////////////////////////////////////

exports.importLocations = async (filePath) => {
    const client = await pool.connect();

    const campusMap = new Map();
    const buildingMap = new Map();
    const floorMap = new Map();
    const roomTypeMap = new Map();

    const stats = {
        campuses: 0,
        buildings: 0,
        floors: 0,
        rooms: 0,
    };

    try {
        await client.query('BEGIN');

        const rows = readExcel(filePath);

        for (const rawRow of rows) {
            const row = {
                campus_code: normalize(rawRow.campus_code),
                building_code: normalize(rawRow.building_code),
                building_name: normalize(rawRow.building_name),
                floor_code: normalize(rawRow.floor_code),
                floor_name: normalize(rawRow.floor_name),
                room_code: normalize(rawRow.room_code),
                room_name: normalize(rawRow.room_name),
                room_type_code: normalize(rawRow.room_type_code),
            };

            // ===== VALIDATION =====
            if (!row.campus_code || !row.building_code || !row.floor_code || !row.room_code) {
                throw new Error(`Missing required field at row: ${JSON.stringify(row)}`);
            }

            // ===== CAMPUS =====
            const campusId = await getOrCreateCampus(client, campusMap, row, stats);

            // ===== BUILDING =====
            const buildingId = await getOrCreateBuilding(
                client,
                buildingMap,
                campusId,
                row,
                stats
            );

            // ===== FLOOR =====
            const floorId = await getOrCreateFloor(
                client,
                floorMap,
                buildingId,
                row,
                stats
            );

            // ===== ROOM TYPE =====
            const roomTypeId = await getRoomType(
                client,
                roomTypeMap,
                row.room_type_code
            );

            // ===== ROOM =====
            await upsertRoom(
                client,
                campusId,
                buildingId,
                floorId,
                roomTypeId,
                row,
                stats
            );
        }

        await client.query('COMMIT');
        return stats;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

//////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////

async function getOrCreateCampus(client, map, row, stats) {
    const key = row.campus_code;

    if (map.has(key)) return map.get(key);

    const res = await client.query(
        `SELECT id FROM campuses WHERE code = $1`,
        [row.campus_code]
    );

    let id;

    if (res.rows.length > 0) {
        id = res.rows[0].id;
    } else {
        const insert = await client.query(
            `INSERT INTO campuses (code, name, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
            [row.campus_code, row.campus_code]
        );
        id = insert.rows[0].id;
        stats.campuses++;
    }

    map.set(key, id);
    return id;
}

async function getOrCreateBuilding(client, map, campusId, row, stats) {
    const key = `${campusId}_${row.building_code}`;

    if (map.has(key)) return map.get(key);

    const res = await client.query(
        `SELECT id FROM buildings WHERE campus_id = $1 AND code = $2`,
        [campusId, row.building_code]
    );

    let id;

    if (res.rows.length > 0) {
        id = res.rows[0].id;
    } else {
        const insert = await client.query(
            `INSERT INTO buildings (campus_id, code, name, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id`,
            [
                campusId,
                row.building_code,
                row.building_name || row.building_code,
            ]
        );
        id = insert.rows[0].id;
        stats.buildings++;
    }

    map.set(key, id);
    return id;
}

async function getOrCreateFloor(client, map, buildingId, row, stats) {
    const key = `${buildingId}_${row.floor_code}`;

    if (map.has(key)) return map.get(key);

    const res = await client.query(
        `SELECT id FROM floors WHERE building_id = $1 AND code = $2`,
        [buildingId, row.floor_code]
    );

    let id;

    if (res.rows.length > 0) {
        id = res.rows[0].id;
    } else {
        const insert = await client.query(
            `INSERT INTO floors (building_id, code, name, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id`,
            [
                buildingId,
                row.floor_code,
                row.floor_name || row.floor_code,
            ]
        );
        id = insert.rows[0].id;
        stats.floors++;
    }

    map.set(key, id);
    return id;
}

async function getRoomType(client, map, code) {
    if (!code) return null;

    if (map.has(code)) return map.get(code);

    const res = await client.query(
        `SELECT id FROM room_types WHERE code = $1`,
        [code]
    );

    if (res.rows.length === 0) {
        throw new Error(`Room type not found: ${code}`);
    }

    const id = res.rows[0].id;
    map.set(code, id);
    return id;
}

async function upsertRoom(
    client,
    campusId,
    buildingId,
    floorId,
    roomTypeId,
    row,
    stats
) {
    const res = await client.query(
        `SELECT id FROM rooms 
     WHERE campus_id = $1 AND building_id = $2 AND floor_id = $3 AND code = $4`,
        [campusId, buildingId, floorId, row.room_code]
    );

    if (res.rows.length > 0) {
        await client.query(
            `UPDATE rooms
       SET name = $1,
           room_type_id = $2,
           updated_at = NOW()
       WHERE id = $3`,
            [row.room_name, roomTypeId, res.rows[0].id]
        );
    } else {
        await client.query(
            `INSERT INTO rooms (
        campus_id,
        building_id,
        floor_id,
        room_type_id,
        code,
        name,
        created_at,
        updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
            [
                campusId,
                buildingId,
                floorId,
                roomTypeId,
                row.room_code,
                row.room_name,
            ]
        );

        stats.rooms++;
    }
}
exports.generateTemplateLocations = async () => {
    const wb = XLSX.utils.book_new();

    //////////////////////////////////////////////////////
    // 1. RAW_DATA SHEET
    //////////////////////////////////////////////////////
    const rawData = [
        ['building', 'floor', 'room'],
        ['A', '2', '201'],
        ['A', '2', '202'],
    ];

    const rawSheet = XLSX.utils.aoa_to_sheet(rawData);
    XLSX.utils.book_append_sheet(wb, rawSheet, 'RAW_DATA');

    //////////////////////////////////////////////////////
    // 2. IMPORT SHEET (WITH FORMULA)
    //////////////////////////////////////////////////////
    const importData = [
        ['campus_code', 'building_code', 'floor_code', 'room_code', 'room_type_code'],
    ];

    const importSheet = XLSX.utils.aoa_to_sheet(importData);

    // generate 200 rows formula
    for (let i = 2; i <= 200; i++) {
        importSheet[`A${i}`] = { f: `"CS1"` };
        importSheet[`B${i}`] = { f: `RAW_DATA!A${i}` };
        importSheet[`C${i}`] = { f: `RAW_DATA!B${i}` };
        importSheet[`D${i}`] = { f: `RAW_DATA!A${i} & TEXT(RAW_DATA!C${i},"000")` };
        importSheet[`E${i}`] = { f: `"classroom"` };
    }

    XLSX.utils.book_append_sheet(wb, importSheet, 'IMPORT');

    //////////////////////////////////////////////////////
    // 3. ROOM_TYPES (FROM DB)
    //////////////////////////////////////////////////////
    const client = await pool.connect();

    let roomTypes = [];

    try {
        const res = await client.query(`
      SELECT code, name
      FROM room_types
      ORDER BY code
    `);

        roomTypes = res.rows.map(r => [r.code, r.name]);
    } finally {
        client.release();
    }

    const roomTypeSheet = XLSX.utils.aoa_to_sheet([
        ['code', 'name'],
        ...roomTypes,
    ]);

    XLSX.utils.book_append_sheet(wb, roomTypeSheet, 'ROOM_TYPES');

    //////////////////////////////////////////////////////
    // EXPORT BUFFER
    //////////////////////////////////////////////////////
    const buffer = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'buffer',
    });

    return buffer;
};

exports.previewImportRoomNames = async (filePath) => {

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // ===== HEADER (ĐỌC TRỰC TIẾP CELL) =====
    const campus_name = normalize(sheet['B1']?.v);
    const academic_year = normalize(sheet['B2']?.v);

    if (!campus_name) {
        throw new Error('Thiếu campus_name (B1)');
    }

    if (!academic_year) {
        throw new Error('Thiếu academic_year (B2)');
    }

    if (!/^\d{4}-\d{4}$/.test(academic_year)) {
        throw new Error(`Academic year không hợp lệ: ${academic_year}`);
    }

    // ===== DATA TABLE =====
    const rows = XLSX.utils.sheet_to_json(sheet, { range: 3 });

    const parsed = [];
    const errors = [];

    rows.forEach((r, index) => {

        const building_name = normalize(r.building_name);
        const room_code = normalize(r.room_code);
        const room_name = normalize(r.room_name);

        if (!building_name || !room_code) {
            errors.push({
                row: index + 4,
                message: 'Thiếu building_name hoặc room_code'
            });
            return;
        }

        parsed.push({
            building_name,
            room_code,
            room_name
        });
    });

    return {
        campus_name,
        academic_year,
        total: parsed.length,
        errors,
        rows: parsed.slice(0, 50)
    };
};
exports.importRoomNames = async (filePath) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // ===== HEADER =====
        const campus_name = normalize(sheet['B1']?.v);
        const academic_year = normalize(sheet['B2']?.v);

        if (!campus_name) {
            throw new Error('Thiếu campus_name (B1)');
        }

        if (!academic_year) {
            throw new Error('Thiếu academic_year (B2)');
        }

        if (!/^\d{4}-\d{4}$/.test(academic_year)) {
            throw new Error(`Academic year không hợp lệ: ${academic_year}`);
        }

        // ===== DATA =====
        const rows = XLSX.utils.sheet_to_json(sheet, { range: 3 });

        // ===== MAP CAMPUS =====
        const cRes = await client.query(
            `SELECT id FROM campuses WHERE name = $1`,
            [campus_name]
        );

        if (!cRes.rows.length) {
            throw new Error(`Không tìm thấy campus: ${campus_name}`);
        }

        const campusId = cRes.rows[0].id;

        let inserted = 0;
        let updated = 0;
        const errors = [];

        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];

            try {
                const building_name = normalize(r.building_name);
                const room_code = normalize(r.room_code);
                const room_name = normalize(r.room_name);

                if (!building_name || !room_code) {
                    errors.push({
                        row: i + 4,
                        message: 'Thiếu building_name hoặc room_code'
                    });
                    continue;
                }

                // ===== BUILDING =====
                const bRes = await client.query(
                    `SELECT id FROM buildings WHERE name = $1 AND campus_id = $2`,
                    [building_name, campusId]
                );

                if (!bRes.rows.length) {
                    throw new Error(`Không tìm thấy building: ${building_name}`);
                }

                const buildingId = bRes.rows[0].id;

                // ===== ROOM =====
                const roomRes = await client.query(
                    `SELECT id FROM rooms 
           WHERE code = $1 AND building_id = $2 AND campus_id = $3`,
                    [room_code, buildingId, campusId]
                );

                if (!roomRes.rows.length) {
                    throw new Error(`Không tìm thấy room: ${building_name}-${room_code}`);
                }

                const roomId = roomRes.rows[0].id;

                // ===== UPSERT =====
                const result = await client.query(`
          INSERT INTO room_names_by_year
          (room_id, campus_id, building_id, room_code, academic_year, room_name)
          VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (room_id, academic_year)
          DO UPDATE SET room_name = EXCLUDED.room_name
          RETURNING xmax = 0 AS inserted
        `, [
                    roomId,
                    campusId,
                    buildingId,
                    room_code,
                    academic_year,
                    room_name
                ]);

                if (result.rows[0].inserted) inserted++;
                else updated++;

            } catch (err) {
                errors.push({
                    row: i + 4,
                    message: err.message
                });
            }
        }

        await client.query('COMMIT');

        return {
            success: errors.length === 0,
            total: rows.length,
            inserted,
            updated,
            errors
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
exports.generateTemplateRoomNames = async () => {
    const wb = XLSX.utils.book_new();

    const data = [
        ['campus_name', 'CS1'],
        ['academic_year', '2025-2026'],
        [],
        ['building_name', 'room_code', 'room_name'],
        ['Nhà A', '101', '10A1'],
        ['Nhà A', '102', '10A2'],
        ['Nhà B', '302', 'Phòng họp']
    ];

    const sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, sheet, 'IMPORT');

    return XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'buffer'
    });
};
