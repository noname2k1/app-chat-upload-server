const express = require('express');
const app = express();
const { welComeRoutes } = require('../src/router');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
welComeRoutes(app);

const POST = 9999;

app.listen(POST, () => console.log(`welcome is running on port ${POST}`));

module.exports = app;
