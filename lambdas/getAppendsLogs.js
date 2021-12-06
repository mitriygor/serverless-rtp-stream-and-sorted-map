/**
 * The lambda logs to the DynamoDB appended packets
 *
 * */

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const dDB = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = async (event, context) => {
  try {
    const params = {
      TableName: process.env.DYNAMO_DB
    };
    let logs = await dDB.scan(params, (err, data) => {
      if (err) {
        console.error('getAppendsLogs:err', err);
      } else {
        console.log('getAppendsLogs:data', data);
      }
    }).promise();

    logs = logs.Items.map(log => {
      return {
        sequenceNumber: parseInt(log.sequenceNumber.N, 10), timestamp: parseInt(log.timestamp.N, 10)
      };
    });
    return {
      statusCode: 200, body: logs
    };
  } catch (err) {
    console.error('getAppendsLogs:catch:err', err);
    return {
      statusCode: 400, error: err
    };
  }
};
