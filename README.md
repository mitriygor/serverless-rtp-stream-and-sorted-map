
## RTP
RTP — "Real-time Transport Protocol" — is a common protocol used to stream data (typically media, i.e. audio and video) over the internet, in real-time. The starter code contains a simple implementation of an RTP transmitter and an RTP receiver.

## Quick Start

To install dependencies, run

```
npm install
```

The `data` directory contains a single file, `input.ulaw`. In one terminal tab, run

```
npm run receive
```

and in another one, run

```
npm run transmit
```

The transmitter will read the data from `input.ulaw` and send it as a stream of RTP packets to the receiver, in real time. When all of the data is transmitter (this will take a few seconds), both processes will shut themselves down, and the receiver will write an `output.ulaw` file to the `data` directory. The two files should be identical.

## Code structure

In the `src` directory:

- `receiver.ts` contains the code that powers `npm run receive`

- `transmitter.ts` contains the code that powers `npm run transmit`

- `rtp-packet.ts` contains a utility class that implements encoding and decoding RTP packets

- `file-processor.ts` provides basic functionality for processing a file stream. It uses a `fs`

- `logging.ts` provides logging functionality. Logs could be preserved in AW DynamoDB and S3

- `rtp-list.ts` a data structure in order to preserve packets as a sorted dictionary 

- `validation.ts` triggers validation in order to verify if all packets preserved properly


In the `lambdas` directory:

- `logPacket.js` logs received packet

- `logAppend.js` logs appended packet

- `getAppendsLogs.js` returns `sequenceNumber` of appended packets

- `recreateTable.js` triggers a state machine which recreates DynamoDB tables for development purposes

- `deleteTable.js` deletes DynamoDB table for development purposes

- `createTable.js` create a new DynamoDB table

- `uploadPacket.js` uploads a packet to S3

- `validateAppends.js`  processes basic validation of appended packets

- `createFile.js`  creates a file if the validation fails

- `returnSuccess.js`  returns success if the validation passes successfully 

- `recreateTable.json` state machine for recreating DynamoDB tables for testing purposes

- `validateOutput.json` state machine which contains a sequence of lambda functions for processing validation, and returning a file if validation  returns `false`


## State Machines

### Validate Output

![Screenshot](images/validateOutput-stateMachine.png)

### Recreate Table

![Screenshot](images/recreateTable-stateMachine.png)


