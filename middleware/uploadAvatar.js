const multer = require('@koa/multer');

const storage = multer.diskStorage({});

const upload = multer({ storage });

module.exports = upload.fields([
  {
    name: 'avatar',
  },
]);
