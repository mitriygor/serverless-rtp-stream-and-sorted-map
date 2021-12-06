/**
 * The lambda deletes a DynamoDB table for developing purposes
 *
 * */

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
AWS.config.apiVersions = {dynamodb: '2012-08-10'};

const dynamodb = new AWS.DynamoDB();

exports.handler = async (event) => {
  try {
    const params = {TableName: event.tableName};
    let response;

    await dynamodb.deleteTable(params, (err, data) => {
      if (err) {
        console.log('deleteTable:err', err);
        response = {
          statusCode: 400, error: err
        };
      } else {
        console.log('deleteTable:data', data);
        response = {
          statusCode: 200, body: data
        };
      }
    }).promise();

    return response;
  } catch (err) {
    console.error('deleteTable:catch:err', err);
    return {
      statusCode: 400, error: err
    };
  }
};
