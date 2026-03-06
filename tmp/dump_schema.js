const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('prisma/dev.db');
let output = '';

db.serialize(() => {
    db.each("SELECT sql FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) {
            console.error(err.message);
        }
        output += row.sql + '\n-----------------------------------\n';
    }, () => {
        fs.writeFileSync('tmp/schema_dump.txt', output);
        console.log('Schema dumped to tmp/schema_dump.txt');
    });
});

db.close();
