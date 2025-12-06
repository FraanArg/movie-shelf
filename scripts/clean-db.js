const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'db.json');

try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const items = JSON.parse(data);

    console.log(`Original count: ${items.length}`);

    const uniqueItems = Array.from(new Map(items.map(m => [m.imdbId || m.id, m])).values());

    console.log(`Unique count: ${uniqueItems.length}`);

    if (items.length !== uniqueItems.length) {
        fs.writeFileSync(dbPath, JSON.stringify(uniqueItems, null, 2));
        console.log('Cleaned db.json');
    } else {
        console.log('db.json was already clean');
    }
} catch (e) {
    console.error('Error cleaning db:', e);
}
