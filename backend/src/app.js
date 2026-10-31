const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const serviceRoutes = require('./routes/serviceRoutes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.use('/api/services', serviceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;