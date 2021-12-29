const express = require('express');
const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

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

app.listen(5000);
