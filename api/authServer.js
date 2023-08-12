require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connect = require('../src/tools/connectToMongo');
const { authRoutes } = require('../src/router');
app.use(cors());
connect();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
authRoutes(app);

const POST = process.env.AUTH_PORT || 4000;

app.listen(POST, () => console.log(`auth-server is running on port ${POST}`));

module.exports = app;
