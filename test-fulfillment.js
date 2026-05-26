const fulfillment = require('./fulfillment');
const fs = require('fs');

console.log('Testing Netflix Fulfillment System...');

// 1. Initial State
const accounts = JSON.parse(fs.readFileSync('./accounts.json', 'utf8'));
console.log(`Initial available accounts: ${accounts.filter(a => !a.used).length}`);

// 2. Pick an account
const account = fulfillment.getAvailableAccount();
if (account) {
    console.log(`SUCCESS: Picked account ${account.email}`);
} else {
    console.log('FAILURE: No account picked.');
}

// 3. Final State
const updatedAccounts = JSON.parse(fs.readFileSync('./accounts.json', 'utf8'));
console.log(`Final available accounts: ${updatedAccounts.filter(a => !a.used).length}`);

if (updatedAccounts.find(a => a.id === account.id).used === true) {
    console.log('TEST PASSED: Account marked as used.');
} else {
    console.log('TEST FAILED: Account not marked as used.');
}

// 4. Simulate Email
fulfillment.sendDeliveryEmail('customer@example.com', account);
fulfillment.notifyAdmin('customer@example.com');
