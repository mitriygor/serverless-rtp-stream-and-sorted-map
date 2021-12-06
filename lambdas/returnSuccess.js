/**
 * Just returns successful response
 *
 * */
exports.handler = async () => {
  return {
    statusCode: 200, body: JSON.stringify('Done'),
  };
};
