function setLanguage(lang) {
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });

    document.querySelectorAll('[data-en-placeholder]').forEach(el => {
        el.placeholder = el.getAttribute(`data-${lang}-placeholder`);
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === lang) {
            btn.classList.add('active');
        }
    });

    localStorage.setItem('preferredLanguage', lang);
}

// Initial language set
const savedLang = localStorage.getItem('preferredLanguage') || 'en';
setLanguage(savedLang);

const form = document.getElementById('checkout-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const ctaBtn = document.getElementById('cta-btn');

    ctaBtn.disabled = true;
    ctaBtn.textContent = savedLang === 'en' ? 'Processing...' : 'Procesando...';

    try {
        // 1. Fetch the real publishable key from the server
        const configResponse = await fetch('/config');
        const { publishableKey } = await configResponse.json();

        // 2. Create the checkout session
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const session = await response.json();
        if (session.error) throw new Error(session.error);

        // 3. Redirect to Stripe Checkout
        const stripe = Stripe(publishableKey);
        const result = await stripe.redirectToCheckout({
            sessionId: session.id,
        });

        if (result.error) {
            alert(result.error.message);
            ctaBtn.disabled = false;
            ctaBtn.textContent = savedLang === 'en' ? 'Get Access Now' : 'Obtener acceso ahora';
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Something went wrong. Please try again.');
        ctaBtn.disabled = false;
        ctaBtn.textContent = savedLang === 'en' ? 'Get Access Now' : 'Obtener acceso ahora';
    }
});

