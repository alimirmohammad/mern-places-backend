const { Router } = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller');

const router = Router();

router.get('/', usersController.getAllUsers);
router.post(
  '/signup',
  [
    check('name').notEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersController.signup
);
router.post('/login', usersController.login);

module.exports = router;
