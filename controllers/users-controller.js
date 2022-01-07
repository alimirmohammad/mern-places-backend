const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
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

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError('Could not create user', 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    places: [],
    image: req.file.path,
  });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Could not sign up', 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Could not sign up', 500);
    return next(error);
  }
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
}

async function login(req, res, next) {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError('Something went wrong!', 500));
  }
  if (!existingUser)
    return next(new HttpError('Email or password is wrong', 401));

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(new HttpError('Something went wrong!', 500));
  }

  if (!isValidPassword)
    return next(new HttpError('Email or password is wrong', 401));

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Could not login', 500);
    return next(error);
  }
  res
    .status(201)
    .json({ userId: existingUser.id, email: existingUser.email, token });
}

exports.getAllUsers = getAllUsers;
exports.signup = signup;
exports.login = login;
