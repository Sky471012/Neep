const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
require('dotenv').config();
app.use(express.json());

app.listen(5000, () => console.log('Server started on port 5000'));