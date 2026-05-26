require('dotenv').config();
const { kv } = require('@vercel/kv');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Picks an available account from the Redis list (atomic pop).
 */
async function getAvailableAccount() {
    try {
        const accountData = await kv.lpop('b4_accounts');
        if (!accountData) {
            return null; // No available accounts
        }
        return typeof accountData === 'string' ? JSON.parse(accountData) : accountData;
    } catch (err) {
        console.error('Error popping account from KV:', err);
        return null;
    }
}

/**
 * Sends the delivery email using Resend
 */
async function sendDeliveryEmail(customerEmail, accountData) {
    console.log(`--- [EMAIL INITIATED] ---`);
    console.log(`To: ${customerEmail}`);

    // For Resend, the 'from' email must be verified in the domain configuration.
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    try {
        const data = await resend.emails.send({
            from: `b4bestreview <${fromEmail}>`,
            to: [customerEmail],
            subject: 'Your b4bestreview Streaming Access Details',
            html: `
            <div style="font-family: sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center;">Welcome to b4bestreview! 🍿</h2>
                    <p style="color: #555; font-size: 16px;">Thank you for your purchase. Here are your streaming credentials:</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6366f1;">
                        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${accountData.email}</p>
                        <p style="margin: 0;"><strong>Password:</strong> ${accountData.password}</p>
                    </div>
                    <p style="color: #777; font-size: 14px;">Enjoy your movies and shows! If you have any issues, reply to this email.</p>
                </div>
            </div>
            `
        });
        console.log('Email sent successfully:', data);
        return true;
    } catch (error) {
        console.error('Error sending email via Resend:', error);
        return false;
    }
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
