const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'deweaxqpl',
    api_key: '736865289687164',
    api_secret: 'A-KJP7ocn1ois6oGPbB5gvGWGBc',
    secure: true,
  });

module.exports = cloudinary;
