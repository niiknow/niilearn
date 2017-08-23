const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./router');

const app = express();
const _VERSION = process.env.API_VERSION || 1;
const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length > 0) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.json({
  limit: '50mb',
  type: 'application/json',
  verify: rawBodySaver
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  verify: rawBodySaver,
  extended: true,
  parameterLimit: 500000
}));
app.use(cors());
app.use(`/api/v${_VERSION}`, router);

module.exports = app;
