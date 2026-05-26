require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const path = require('path');
const cors = require('cors');
const fulfillment = require('./fulfillment');

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const DOMAIN = process.env.DOMAIN || 'http://localhost:3000';

app.post('/create-checkout-session', async (req, res) => {
    const { email } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'b4bestreview Subscription',
                            description: 'Personalized Movie & Streaming Recommendations',
                        },
                        unit_amount: 499, // $4.99 in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${DOMAIN}/index.html`,
        });

        res.json({ id: session.id });
    } catch (err) {
        console.error('Error creating session:', err);
        res.status(500).json({ error: err.message });
    }
});

// Success page
app.get('/success.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/success.html'));
});

// Webhook endpoint to handle post-purchase logic
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder');
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const customerEmail = session.customer_email;

        console.log(`Processing successful payment for: ${customerEmail}`);

        // 1. Notify Admin
        await fulfillment.notifyAdmin(customerEmail);

        // 2. Automate Fulfillment
        const account = await fulfillment.getAvailableAccount();
        if (account) {
            await fulfillment.sendDeliveryEmail(customerEmail, account);
            console.log(`Order fulfilled successfully for ${customerEmail}`);
        } else {
            console.error(`SHIT! No accounts available for ${customerEmail}. Admin notified for manual fulfillment.`);
        }
    }

    res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;
