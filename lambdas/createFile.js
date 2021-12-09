/**
 * The lambda re-creates the file based on available data from AWS DynamoDB
 * The re-created file is preserved to AWS S3
 * The lambda is used in cases when validation detects any type of discrepancies
 *
 * */

const fs = require('fs');
const AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_KEY
});


const randNumber = Math.floor(Math.random() * 10000);
const TEMP_FILE = '/tmp/output_' + randNumber.toString() + '.ulaw';

if (fs.existsSync(TEMP_FILE)) {
  fs.unlinkSync(TEMP_FILE);
}

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const stream = fs.createWriteStream(TEMP_FILE, {flags: 'a'});

exports.handler = async (event) => {
  const minLimit = event.isValid.logs[0].sequenceNumber;
  const maxLimit = event.isValid.logs[event.isValid.logs.length - 1].sequenceNumber;

  for (let i = minLimit; i < maxLimit; i++) {
    const params = {
      FilterExpression: 'sequenceNumber = :seq',
      ExpressionAttributeValues: {':seq': {N: i.toString()}},
      TableName: process.env.DYNAMO_DB
    };
    const packet = await dynamodb.scan(params, (err, data) => {
      if (err) {
        console.error(err);
      }
    }).promise();

    if (!!packet && !!packet.Items && !!packet.Items[0] && !!packet.Items[0].payload && !!packet.Items[0].payload.S) {
      const packetPayload = packet.Items[0].payload.S;
      const buffer = Buffer.from(packetPayload, 'binary');
      stream.write(buffer);
    }
  }

  stream.end();

  const fileContent = fs.readFileSync(TEMP_FILE);
  const params = {
    Bucket: 'packets-replica-s3-bucket',
    Key: 'output_' + randNumber.toString() + '.ulaw', // File name you want to save as in S3
    Body: fileContent
  };

  // Uploading files to the bucket
  await s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  }).promise();
};
