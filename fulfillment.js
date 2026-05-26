const fs = require('fs');
const path = require('path');

const ACCOUNTS_FILE = path.join(__dirname, 'accounts.json');

/**
 * Picks an available account from the pool and marks it as used.
 */
function getAvailableAccount() {
    try {
        const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
        const accounts = JSON.parse(data);

        const index = accounts.findIndex(acc => !acc.used);
        if (index === -1) {
            return null; // No available accounts
        }

        const account = accounts[index];
        accounts[index].used = true;

        fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 4));

        return account;
    } catch (err) {
        console.error('Error reading/writing accounts file:', err);
        return null;
    }
}

/**
 * Simulates sending an email (in production, use Resend, SendGrid, etc.)
 */
async function sendDeliveryEmail(customerEmail, accountData) {
    console.log(`--- [EMAIL SIMULATION] ---`);
    console.log(`To: ${customerEmail}`);
    console.log(`Subject: Your b4bestreview Netflix Access`);
    console.log(`Content:`);
    console.log(`Welcome to b4bestreview! Here are your Netflix credentials:`);
    console.log(`Email: ${accountData.email}`);
    console.log(`Password: ${accountData.password}`);
    console.log(`--------------------------`);

    // Placeholder for real email API call
    /*
    await resend.emails.send({
      from: 'b4bestreview <noreply@b4bestreview.com>',
      to: customerEmail,
      subject: 'Your Netflix Access Details',
      html: `<p>Enjoy your movies! User: ${accountData.email}, Pass: ${accountData.password}</p>`
    });
    */
    return true;
}

/**
 * Notifies the admin of a new order
 */
async function notifyAdmin(customerEmail) {
    console.log(`--- [ADMIN NOTIFICATION] ---`);
    console.log(`Alert: New Payment from ${customerEmail}`);
    console.log(`Action Required: Fulfill or verify delivery.`);
    console.log(`-----------------------------`);
}

module.exports = {
    getAvailableAccount,
    sendDeliveryEmail,
    notifyAdmin
};
