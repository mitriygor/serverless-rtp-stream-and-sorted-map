/**
 * The lambdas provides basic validation of appended packets based on their sequence numbers
 *
 * */

exports.handler = async (event) => {

  let sortedLogs = event.logs.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  let isValid = true;
  const maxLimit = sortedLogs.length - 1;
  let i = 0;

  while (isValid && i < maxLimit) {
    isValid = (sortedLogs[i + 1].sequenceNumber - sortedLogs[i].sequenceNumber === 1);
    i++;
  }

  return {logs: sortedLogs, isValid: isValid};
};
