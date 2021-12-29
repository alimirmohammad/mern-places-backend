const { Router } = require('express');
const { check } = require('express-validator');
const placesController = require('../controllers/places-controller');

const router = Router();

router.get('/:pid', placesController.getPlaceById);
router.get('/user/:uid', placesController.getPlacesByUserId);
router.post(
  '/',
  [
    check('title').notEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').notEmpty(),
  ],
  placesController.createPlace
);
router.patch(
  '/:pid',
  [check('title').notEmpty(), check('description').isLength({ min: 5 })],
  placesController.updatePlace
);
router.delete('/:pid', placesController.deletePlace);

module.exports = router;
