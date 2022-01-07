const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

function checkAuth(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) throw new Error('No token');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(new HttpError('Not Authenticated!', 401));
  }
}

module.exports = checkAuth;
