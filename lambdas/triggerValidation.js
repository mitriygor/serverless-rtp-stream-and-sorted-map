/**
 * The lambdas triggers the validation state machine
 *
 * */
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const stepFunction = new AWS.StepFunctions();

exports.handler = async (event, context) => {
  const params = {
    stateMachineArn: process.env.STATE_MACHINE_ARN
  };
  await stepFunction.startExecution(params).promise();
};
