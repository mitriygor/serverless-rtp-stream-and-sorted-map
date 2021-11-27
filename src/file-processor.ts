import {RTPPacket} from './rtp-packet';
import {RTPList} from './rtp-list';
import fs from 'fs';
import {Logging} from './logging';

const TEMP_FILE = './data/output.ulaw';

export class FileProcessor {
    private stream;
    private logging;

    constructor() {
        this.stream = fs.createWriteStream(TEMP_FILE, {flags: 'a'});
        this.logging = new Logging();
    }

    public cleanFile(): void {
        fs.truncate(TEMP_FILE, 0, () => {
            console.log('FileProcessor::cleanFile::done');
        });
    }

    public appendToFile(packets: RTPList, minBufferSize = 0): void {
        while (packets.sequenceNumbers.length > minBufferSize) {
            const packet: RTPPacket | undefined = packets.getPacket();
            if (packet) {
                this.stream.write(packet.payload);
                this.logging.logAppend(packet, packets.sequenceNumbers.length);
            }
        }
    }

    public closeStream(): void {
        this.stream.end();
    }
}
