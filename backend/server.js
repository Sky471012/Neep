const express = require('express');
const app = express();
const cors = require('cors');
const mongoDB = require("./db")
require('dotenv').config();

mongoDB();

app.use(cors());

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})