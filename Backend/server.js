const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',');

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/stores');
const ownerRoutes = require('./routes/owner');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/owner', ownerRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Store Rating API is running',
        timestamp: new Date().toISOString(),
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' ? { message: err.message } : {}),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n[Error] Port ${PORT} is already in use.`);
            console.error(`Kill the existing process on port ${PORT} or change PORT in your .env file.\n`);
            process.exit(1); // Exits cleanly without dumping the node.js stack trace
        } else {
            throw err;
        }
    });
}

module.exports = { app };