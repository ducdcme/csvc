DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT
            c.relname AS table_name,
            a.attname AS column_name,
            s.relname AS sequence_name
        FROM pg_class s
        JOIN pg_depend d ON d.objid = s.oid
        JOIN pg_class c ON d.refobjid = c.oid
        JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.refobjsubid
        WHERE s.relkind = 'S'
    LOOP
        EXECUTE format(
            'SELECT setval(pg_get_serial_sequence(''%I'', ''%I''), COALESCE(MAX(%I), 1)) FROM %I;',
            rec.table_name,
            rec.column_name,
            rec.column_name,
            rec.table_name
        );
    END LOOP;
END $$;