const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user');

async function getAllUsers(req, res, next) {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    return next(new Error('Something went wrong!, 500'));
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
}

async function signup(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs'));
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError('There was a problem fetching data', 500);
    return next(error);
  }
  if (existingUser) {
    return next(new HttpError('Email already exists', 422));
  }

  const createdUser = new User({
    name,
    email,
    password,
    places: [],
    image:
      'https://image.freepik.com/free-photo/pleasant-looking-serious-man-stands-profile-has-confident-expression-wears-casual-white-t-shirt_273609-16959.jpg',
  });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Could not sign up', 500);
    return next(error);
  }
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
}

async function login(req, res, next) {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError('Something went wrong!', 500));
  }
  if (!existingUser || existingUser.password !== password)
    return next(new HttpError('Email or password is wrong', 401));
  res.json({ user: existingUser.toObject({ getters: true }) });
}

exports.getAllUsers = getAllUsers;
exports.signup = signup;
exports.login = login;
