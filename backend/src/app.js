const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const variantRoutes = require('./routes/variantRoutes');
const extraRoutes = require('./routes/extraRoutes')
const petRoutes = require('./routes/petRoutes');
const citaRoutes = require('./routes/citaRoutes');

const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/extras', extraRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/citas', citaRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;