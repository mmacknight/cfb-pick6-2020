const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
var config = require('../config/AWSconfig.js');


aws.config.update({
  secretAccessKey: config.s3_env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: config.s3_env.AWS_ACCESS_KEY,
  region: config.s3_env.REGION
});

const s3 = new aws.S3()

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.s3_env.BUCKET,
    acl: 'public-read',
    contentDisposition: 'inline',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    cacheControl: 'max-age=0',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: 'METADATA'});
    },
    key: function (req, file, cb) {
      cb(null, 'league_'+req.query.league_id);
    }
  })
})

module.exports = upload
