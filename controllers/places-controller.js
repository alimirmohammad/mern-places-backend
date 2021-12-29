const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const getCoordsFromAddress = require('../utils/locations');

const DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world.',
    location: { lat: 40.7484445, lng: -73.9878531 },
    address: '20 W 34th St, New York, NY 10001, United States',
    creator: 'u1',
  },
];

function getPlaceById(req, res) {
  const { pid } = req.params;
  const place = DUMMY_PLACES.find(p => p.id === pid);
  if (!place) {
    throw new HttpError('This place could not be found', 404);
  }
  res.json({ place });
}

function getPlacesByUserId(req, res, next) {
  const { uid } = req.params;
  const places = DUMMY_PLACES.filter(p => p.creator === uid);
  if (places.length === 0) {
    return next(new HttpError('There is no places for this user', 404));
  }
  res.json({ places });
}

function createPlace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new HttpError('Invalid inputs');
  const { title, description, address, creator } = req.body;
  const coordinates = getCoordsFromAddress(address);
  const place = {
    id: uuidv4(),
    title,
    description,
    address,
    creator,
    location: coordinates,
  };
  DUMMY_PLACES.push(place);
  res.status(201).json({ place });
}

function updatePlace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new HttpError('Invalid inputs');
  const { title, description } = req.body;
  const { pid } = req.params;
  const updatedPlace = DUMMY_PLACES.find(p => p.id === pid);
  if (!updatedPlace) throw new HttpError('Place not found', 404);
  updatedPlace.title = title;
  updatedPlace.description = description;
  res.status(200).json({ place: updatedPlace });
}

function deletePlace(req, res, next) {
  const { pid } = req.params;
  const index = DUMMY_PLACES.findIndex(p => p.id === pid);
  if (index < 0) throw new HttpError('Place not found', 404);
  DUMMY_PLACES.splice(index, 1);
  res.status(200).json({ message: 'Place Deleted' });
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
