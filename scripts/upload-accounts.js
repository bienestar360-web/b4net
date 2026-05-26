require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { kv } = require('@vercel/kv');

async function migrate() {
    try {
        console.log('Reading local accounts.json...');
        const data = fs.readFileSync(path.join(__dirname, '../accounts.json'), 'utf8');
        const accounts = JSON.parse(data);

        const availableAccounts = accounts.filter(acc => !acc.used);

        if (availableAccounts.length === 0) {
            console.log('No unused accounts to upload.');
            return;
        }

        console.log(`Uploading ${availableAccounts.length} accounts to Vercel KV...`);

        // Use a pipeline or multiple lpush. lpush takes an array.
        // We push them to the "b4_accounts" list.
        for (const acc of availableAccounts) {
            await kv.lpush('b4_accounts', JSON.stringify(acc));
        }

        // Wait a bit and verify
        const length = await kv.llen('b4_accounts');
        console.log(`Upload complete! Total accounts now in KV queue: ${length}`);

    } catch (err) {
        console.error('Error during migration:', err);
    }
}

migrate();
