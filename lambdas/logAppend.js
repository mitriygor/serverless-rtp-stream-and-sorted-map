/**
 * The lambda logs to the DynamoDB appended packets
 *
 * */

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {

  try {
    const params = {
      TableName: 'appends-logs', Item: {
        sequenceNumber: parseInt(event.sequenceNumber, 10),
        timestamp: parseInt(event.timestamp, 10),
        packetsAmount: parseInt(event.packetsAmount, 10)
      }
    };
    let response;

    await documentClient.put(params, function (err, data) {
      if (err) {
        console.log('err', err);
        response = {
          statusCode: 400, error: err
        };
      } else {
        console.log('data', data);
        response = {
          statusCode: 200, body: data
        };
      }
    }).promise();

    return response;
  } catch (err) {
    console.error('Cannot save in DynamoDB', err);
    return {
      statusCode: 400, error: err
    };
  }
};
