import fs from 'fs';

import {Constants} from '../configuration/contants';
import {RTPList} from '../models/rtp-list';
import {RTPPacket} from '../models/rtp-packet';
import {Logging} from './logging';

/**
 * The service creates a stream for appending packets to the output file
 * In addition, for developing purposes, it has an additional method
 * for clean the output file
 *
 * */
export class FileProcessor {
    private stream;
    private logging;

    constructor() {
        this.stream = fs.createWriteStream(Constants.OUTPUT_FILE, {flags: 'a'});
        this.logging = new Logging();
    }

    /**
     * The method clears the output file in order to have empty file on each run
     * It is for developing purposes only
     *
     */
    public cleanFile(): void {
        fs.truncate(Constants.OUTPUT_FILE, 0, () => {
            console.log('FileProcessor::cleanFile::done');
        });
    }

    /**
     * The method append a packet to the output file. Furthermore, each appending is logged
     * In order to keep proper size of the packet list, which is necessary to keep packets in order,
     * the method loops through the available packets till the packets' list is bigger when defined
     * minimum size of the buffer. By default , the minimum buffer size is set to zero,
     * so if the method is called without this parameter, it will loop through all elements.
     * That's exactly how it is called after the transmission is finished.
     *
     * @param {RTPList} packets
     * @param {RTPList} minBufferSize
     */
    public appendToFile(packets: RTPList, minBufferSize = 0): void {
        while (packets.sequenceNumbers.length > minBufferSize) {
            const packet: RTPPacket | undefined = packets.getPacket();
            if (packet) {
                this.stream.write(packet.payload);
                this.logging.logAppend(packet, packets.sequenceNumbers.length);
            }
        }
    }

    /**
     * The method closes the file stream
     *
     */
    public closeStream(): void {
        this.stream.end();
    }
}
