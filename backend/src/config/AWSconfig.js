const s3_env = {
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  REGION: process.env.REGION,
  BUCKET: process.env.BUCKET
}

module.exports = {
     s3_env: s3_env
}
