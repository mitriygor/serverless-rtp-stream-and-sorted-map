import fs from 'fs';

import {Constants} from '../configuration/contants';
import SortedMapInterface from '../interfaces/sorted-map.interface';
import {RTPPacket} from '../models/rtp-packet';
import {LoggingService} from './logging.service';

/**
 * The service creates a stream for appending packets to the output file
 * In addition, for developing purposes, it has an additional method
 * for clean the output file
 *
 * */
export class FileProcessorService {
    private stream;
    private logging;

    constructor() {
        this.stream = fs.createWriteStream(Constants.OUTPUT_FILE, {flags: 'a'});
        this.logging = new LoggingService();
    }

    /**
     * The method clears the output file in order to have empty file on each run
     * It is for developing purposes only
     *
     */
    public cleanFile(): void {
        fs.truncate(Constants.OUTPUT_FILE, 0, () => {
            console.log('FileProcessorService::cleanFile::done');
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
     * @param {SortedMapInterface} packets
     * @param {number} minBufferSize
     */
    public appendToFile(packets: SortedMapInterface<RTPPacket>, minBufferSize = 0): void {
        while (packets.getMapSize() > minBufferSize) {
            const packet: RTPPacket | undefined = packets.shiftItem();
            if (packet) {
                this.stream.write(packet.payload);
                this.logging.logAppend(packet, packets.getMapSize());
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
