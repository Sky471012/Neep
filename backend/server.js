const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const mongoDB = require("./db")
require('dotenv').config();

mongoDB();

const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(compression());

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', message: 'NEEP backend is online' });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', require('./routes/popup'))
app.use("/api/contactus", require("./routes/contactus"));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})