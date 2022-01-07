const multer = require('multer');
const { v1: uuid } = require('uuid');

const MIME_TYPE_EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_EXTENSIONS[file.mimetype];
      cb(null, uuid() + '.' + ext);
    },
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = Boolean(MIME_TYPE_EXTENSIONS[file.mimetype]);
    const error = isValid ? null : new Error('Invalid MIME type!');
    cb(error, isValid);
  },
});

module.exports = fileUpload;
