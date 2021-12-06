/**
 * The lambdas uploads received packets to an AWS S3 bucket
 *
 * */

const AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-1', accessKeyId: process.env.ACCESS_KEY_ID, secretAccessKey: process.env.SECRET_KEY
});

const s3 = new AWS.S3();

exports.handler = async (event, context) => {
  console.log('event', event);
  console.log('context', context);
  let url = '';

  const s3Params = {
    Bucket: process.env.S3_BUCKET,
    Key: event.fileName.toString(),
    Expires: 500,
    ContentType: 'text/plain',
    ACL: 'public-read'
  };

  url = await s3.getSignedUrlPromise('putObject', s3Params);

  return url;
};
