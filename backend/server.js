const express = require('express');
const app = express();
const cors = require('cors');
const mongoDB = require("./db")
require('dotenv').config();

mongoDB();

app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})