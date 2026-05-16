const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/tasks', require('./routes/task.routes'));

// Serve frontend in production
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

async function startServer() {
  let dbUrl = process.env.DATABASE_URL;

  // Use zero-config memory database for local testing if standard localhost is set
  if (!dbUrl || dbUrl.includes('127.0.0.1')) {
    try {
      console.log('Starting in-memory MongoDB for local testing...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      dbUrl = mongoServer.getUri();
    } catch (err) {
      console.log('Could not start memory server', err);
    }
  }

  mongoose.connect(dbUrl)
    .then(() => {
      console.log('Connected to MongoDB successfully');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
    });
}

startServer();
