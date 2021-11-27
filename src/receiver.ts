import dgram from 'dgram';
import {RTPPacket} from './rtp-packet';
import {RTPList} from './rtp-list';
import {FileProcessor} from './file-processor';
import {Logging} from './logging';

const RECEIVER_PORT = 3456;
const NO_MORE_PACKETS_TIMEOUT_MILLIS = 100;
let hasPacketsBuffer = false;
const BUFFER_SIZE = 10;

const logging: Logging = new Logging();
const packets: RTPList = new RTPList();
const fileProcessor: FileProcessor = new FileProcessor();
let finalTimeout: NodeJS.Timeout | undefined;

const server = dgram.createSocket('udp4');

fileProcessor.cleanFile();
logging.recreateTable();

server.on('message', (msg) => {
    const packet = new RTPPacket(msg);
    packets.addPacket(packet);

    if (!hasPacketsBuffer && packets.sequenceNumbers.length > BUFFER_SIZE) {
        hasPacketsBuffer = true;
    }

    if (finalTimeout) {
        clearTimeout(finalTimeout);
    }

    if (hasPacketsBuffer) {
        fileProcessor.appendToFile(packets, BUFFER_SIZE);
    }

    finalTimeout = setTimeout(() => {
        fileProcessor.appendToFile(packets);
        fileProcessor.closeStream();

    }, NO_MORE_PACKETS_TIMEOUT_MILLIS);
});

server.bind(RECEIVER_PORT, () => {
    console.log(`Listening on port ${RECEIVER_PORT}`);
});
