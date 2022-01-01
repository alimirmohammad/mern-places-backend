const express = require('express');
const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const app = express();
app.use(express.json());

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use(function (req, res, next) {
  throw new HttpError('Not Found.', 404);
});

app.use(function (error, req, res, next) {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code ?? 500)
    .json({ message: error.message ?? 'An unknown error occurred!' });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.pj6p0.mongodb.net/places?retryWrites=true&w=majority`
  )
  .then(() => app.listen(5000))
  .catch(console.log);
