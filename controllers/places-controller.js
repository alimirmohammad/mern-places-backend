const fs = require('fs');

const { startSession } = require('mongoose');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const getCoordsFromAddress = require('../utils/locations');
const Place = require('../models/place');
const User = require('../models/user');

async function getPlaceById(req, res, next) {
  const { pid } = req.params;
  let place;
  try {
    place = await Place.findById(pid);
  } catch (error) {
    const err = new HttpError('This place could not be found', 500);
    return next(err);
  }
  if (!place) {
    return next(new HttpError('This place could not be found', 404));
  }
  res.json({ place: place.toObject({ getters: true }) });
}

async function getPlacesByUserId(req, res, next) {
  const { uid } = req.params;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(uid).populate('places');
  } catch (err) {
    const error = new HttpError('There was a problem fetching data', 500);
    return next(error);
  }
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError('There is no places for this user', 404));
  }
  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    ),
  });
}

async function createPlace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs'));
  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (error) {
    const err = new HttpError('Could not get the coordinates', 500);
    return next(err);
  }
  const place = new Place({
    title,
    description,
    image: req.file.path,
    address,
    creator,
    location: coordinates,
  });

  try {
    const user = await User.findById(creator);
    if (!user)
      return next(new HttpError('The creator user ID does not exist.', 404));

    const session = await startSession();
    session.startTransaction();
    await place.save({ session });
    user.places.push(place);
    await user.save({ session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError('Something went wrong', 500));
  }

  res.status(201).json({ place: place.toObject({ getters: true }) });
}

async function updatePlace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs'));
  const { title, description } = req.body;
  const { pid } = req.params;
  let place;
  try {
    place = await Place.findById(pid);
  } catch (error) {
    const err = new HttpError('This place could not be found', 500);
    return next(err);
  }
  if (!place) {
    return next(new HttpError('This place could not be found', 404));
  }
  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (error) {
    const err = new HttpError('This place could not be updated', 500);
    return next(err);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
}

async function deletePlace(req, res, next) {
  const { pid } = req.params;
  let place;
  try {
    place = await Place.findById(pid).populate('creator');
  } catch (error) {
    const err = new HttpError('This place could not be found', 500);
    return next(err);
  }
  if (!place) {
    return next(HttpError('This place could not be found', 404));
  }
  try {
    const imagePath = place.image;
    const session = await startSession();
    session.startTransaction();
    await place.remove({ session });
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await session.commitTransaction();
    fs.unlink(imagePath, console.error);
  } catch (error) {
    const err = new HttpError('This place could not be deleted', 500);
    return next(err);
  }

  res.status(200).json({ message: 'Place Deleted' });
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
