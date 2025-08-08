
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/index');
const cookieParser = require('cookie-parser');
const expressStatusMonitor = require('express-status-monitor');
const app = express();

// Middleware
app.use(expressStatusMonitor());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', routes);

// Start the server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});