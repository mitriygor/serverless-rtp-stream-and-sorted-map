/**
 * The lambda re-creates a DynamoDB table for developing purposes
 *
 * */

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
AWS.config.apiVersions = {dynamodb: '2012-08-10'};

const dynamodb = new AWS.DynamoDB();

exports.handler = async (event) => {

  try {
    const params = {
      TableName: event.tableName,
      KeySchema: [{AttributeName: 'sequenceNumber', KeyType: 'HASH'}],
      AttributeDefinitions: [{AttributeName: 'sequenceNumber', AttributeType: 'N'}],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5, WriteCapacityUnits: 5
      }
    };
    let response;

    await dynamodb.createTable(params, (err, data) => {
      if (err) {
        console.log('createTable:err', err);
        response = {
          statusCode: 400, error: err
        };
      } else {
        console.log('createTable:data', data);
        response = {
          statusCode: 200, body: data
        };
      }
    }).promise();

    return response;
  } catch (err) {
    console.error('createTable:catch:err', err);
    return {
      statusCode: 400, error: err
    };
  }
};
