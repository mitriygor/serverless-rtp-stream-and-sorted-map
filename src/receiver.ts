import dgram from 'dgram';

import {Constants} from '../configuration/contants';
import {RtpMapModel} from '../models/rtp-map.model';
import {RTPPacket} from '../models/rtp-packet';
import {FileProcessorService} from '../services/file-processor.service';
import {LoggingService} from '../services/logging.service';

const packets = new RtpMapModel();
const logging = new LoggingService();
const fileProcessor = new FileProcessorService();

let hasPacketsBuffer = false;
let finalTimeout: NodeJS.Timeout | undefined;

const server = dgram.createSocket('udp4');

fileProcessor.cleanFile();
logging.recreateTable();

server.on('message', (msg) => {

    // converting the message to a RTP packet
    const packet = new RTPPacket(msg);

    // adding the packet to the packet list/map
    packets.pushItem(packet);

    // logging just received packets and uploading it to S3
    logging.logPacket(packet, packets.getMapSize());
    logging.uploadPacket(packet);

    // verifies if the buffer is a big enough in order to guarantee proper order
    if (!hasPacketsBuffer && packets.getMapSize() > Constants.INITIAL_BUFFER_SIZE) {
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
