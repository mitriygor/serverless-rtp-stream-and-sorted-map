/**
 * The lambda logs to the DynamoDB received packets
 *
 * */

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  try {
    const params = {
      TableName: 'packets-logs', Item: {
        sequenceNumber: parseInt(event.sequenceNumber, 10),
        payload: event.payload,
        timestamp: parseInt(event.timestamp, 10),
        packetsAmount: parseInt(event.packetsAmount, 10)
      }
    };
    let response;

    await documentClient.put(params, function (err, data) {
      if (err) {
        response = {
          statusCode: 400, error: err
        };
      } else {
        response = {
          statusCode: 200, body: data
        };
      }
    }).promise();
    return response;
  } catch (err) {
    return {
      statusCode: 400, error: err
    };
  }
};
