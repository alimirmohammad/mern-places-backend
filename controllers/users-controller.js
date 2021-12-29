const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Ali',
    email: 'ali@test.com',
    password: 'tester',
  },
];

function getAllUsers(req, res, next) {
  res.json({ users: DUMMY_USERS });
}

function signup(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new HttpError('Invalid inputs');
  const { name, email, password } = req.body;
  const existingUser = DUMMY_USERS.find(u => u.email === email);
  if (existingUser) throw new HttpError('Email already exists', 422);
  const createdUser = { id: uuidv4(), name, email, password };
  DUMMY_USERS.push(createdUser);
  res.status(201).json({ message: 'User created.' });
}

function login(req, res, next) {
  const { email, password } = req.body;
  const existingUser = DUMMY_USERS.find(u => u.email === email);
  if (!existingUser || existingUser.password !== password)
    throw new HttpError('Email or password is wrong', 401);
  res.json({ message: 'Logged in.' });
}

exports.getAllUsers = getAllUsers;
exports.signup = signup;
exports.login = login;
