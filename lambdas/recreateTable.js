/**
 * The lambda triggers a state machine which re-creates DynamoDB tables for developing purposes
 *
 * */

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const stepFunction = new AWS.StepFunctions();

exports.handler = async (event, context) => {
  const tables = JSON.parse(process.env.TABLES);
  console.log('tables', tables);
  await Promise.all(tables.map(async (tableName) => {
    console.log('tableName', tableName);
    const params = {
      stateMachineArn: process.env.STATE_MACHINE_ARN, input: JSON.stringify({tableName: tableName})
    };
    await stepFunction.startExecution(params).promise();
  }));
};
