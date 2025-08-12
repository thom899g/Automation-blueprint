const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();
const port = 3000;
const secretKey = 'supersecretkey'; // In a real app, use an environment variable

app.use(bodyParser.json());
const usersFilePath = './users.json';

// Helper function to read users from the file
const readUsers = () => {
    try {
        const usersData = fs.readFileSync(usersFilePath);
        return JSON.parse(usersData);
    } catch (error) {
        return []; // Return an empty array if the file doesn't exist or is empty
    }
};

// Helper function to write users to the file
const writeUsers = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// --- User Registration ---
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const users = readUsers();
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { email, password: hashedPassword, hasPaid: false };
    users.push(user);
    writeUsers(users);

    res.status(201).json({ message: 'User registered successfully.' });
});

// --- User Login ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const users = readUsers();
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ email: user.email, hasPaid: user.hasPaid }, secretKey, { expiresIn: '1h' });
    res.json({ token });
});

// --- Stripe Webhook (to update payment status) ---
app.post('/api/stripe-webhook', (req, res) => {
    const { event, data } = req.body;

    if (event.type === 'checkout.session.completed') {
        const session = data.object;
        const userEmail = session.customer_details.email;

        const users = readUsers();
        const user = users.find(user => user.email === userEmail);
        if (user) {
            user.hasPaid = true;
            writeUsers(users);
            console.log(`User ${userEmail} has paid.`);
        }
    }

    res.sendStatus(200);
});

const stripe = require('stripe')('your_stripe_secret_key');

// --- Create Stripe Checkout Session ---
app.post('/api/create-checkout-session', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Automation Blueprint - Starter',
                    },
                    unit_amount: 3900, // $39.00
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `http://localhost:3000/pages/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: 'http://localhost:3000/#home&anchor=deals',
        customer_email: email,
    });

    res.json({ id: session.id });
});

// --- Protected Route Example (for checking access) ---
app.get('/api/check-access', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        if (decoded.hasPaid) {
            res.json({ hasAccess: true });
        } else {
            res.json({ hasAccess: false });
        }
    });
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
