const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'your-secret-key-change-this';

// In-memory user storage (use database in production)
const users = [
    {
        email: 'admin@student.com',
        password: '$2a$10$rXKQH8x8QqPJQqXJPXqK8.8N8K8K8K8K8K8K8K8K8K8K8K8K8K8', // hashed "admin123"
        name: 'Admin User'
    }
];

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '24h' });
    
    res.json({ token, email: user.email, name: user.name });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    users.push({ email, password: hashedPassword, name });
    
    res.json({ message: 'Registration successful' });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
