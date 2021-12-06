import dgram from 'dgram';

import {Constants} from '../configuration/contants';
import {RTPList} from '../models/rtp-list';
import {RTPPacket} from '../models/rtp-packet';
import {FileProcessor} from '../services/file-processor';
import {Logging} from '../services/logging';

const logging: Logging = new Logging();
const packets: RTPList = new RTPList();
const fileProcessor: FileProcessor = new FileProcessor();

let hasPacketsBuffer = false;
let finalTimeout: NodeJS.Timeout | undefined;

const server = dgram.createSocket('udp4');

fileProcessor.cleanFile();
logging.recreateTable();

server.on('message', (msg) => {

    // converting the message to a RTP packet
    const packet = new RTPPacket(msg);

    // adding the packet to the packet list/map
    packets.addPacket(packet);

    // logging just received packets and uploading it to S3
    logging.logPacket(packet, packets.sequenceNumbers.length);
    logging.uploadPacket(packet);

    // verifies if the buffer is a big enough in order to guarantee proper order
    if (!hasPacketsBuffer && packets.sequenceNumbers.length > Constants.INITIAL_BUFFER_SIZE) {
        hasPacketsBuffer = true;
    }

    if (finalTimeout) {
        clearTimeout(finalTimeout);
    }

    // processing appending the packets to the file
    if (hasPacketsBuffer) {
        fileProcessor.appendToFile(packets, Constants.INITIAL_BUFFER_SIZE);
    }

    // appending the rest of packets as soon the transmission is finished
    finalTimeout = setTimeout(() => {
        fileProcessor.appendToFile(packets);
        fileProcessor.closeStream();

    }, Constants.NO_MORE_PACKETS_TIMEOUT_MILLIS);
});

server.bind(Constants.RECEIVER_PORT, () => {
    console.log(`Listening on port ${Constants.RECEIVER_PORT}`);
});
