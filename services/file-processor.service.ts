import fs from 'fs';

import SortedMapInterface from '../interfaces/sorted-map.interface';

/**
 * The service creates a stream for appending packets to the output file
 * In addition, for developing purposes, it has an additional method
 * for clean the output file
 *
 * */
export class FileProcessorService<T extends { payload: Buffer }> {
    private stream;
    private path: string;

    constructor(path = '') {
        this.path = path;
        this.stream = fs.createWriteStream(this.path, {flags: 'a'});
    }

    /**
     * The method clears the output file in order to have empty file on each run
     * It is for developing purposes only
     *
     */
    public cleanFile(): void {

        fs.truncate(this.path, 0, () => {
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
     * @param callback
     */
    public appendToFile(packets: SortedMapInterface<T>, minBufferSize = 0, callback: (packet: T, amount: number) => any): void {
        while (packets.getMapSize() > minBufferSize) {

            const packet: T | undefined = packets.shiftItem();
            if (packet) {
                this.stream.write(packet.payload, () => {
                    try {
                        callback(packet, packets.getMapSize());
                    } catch (e) {
                        console.error('FileProcessorService::appendToFile::callback:error', e);
                    }
                });
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
