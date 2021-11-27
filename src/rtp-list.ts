import {RTPPacket} from './rtp-packet';
import {Logging} from './logging';

export class RTPList {
    public sequenceNumbers: number[];
    public packetsMap: { [index: number]: RTPPacket };
    private logging;

    constructor(sequenceNumbers = [], packetsMap: { [index: number]: RTPPacket } = {}) {
        this.sequenceNumbers = sequenceNumbers;
        this.packetsMap = packetsMap;
        this.logging = new Logging();
    }

    public addPacket(packet: RTPPacket): void {
        if (!this.packetsMap[packet.sequenceNumber]) {
            this.packetsMap[packet.sequenceNumber] = packet;
            this.sequenceNumbers.push(packet.sequenceNumber);
            this.sequenceNumbers.sort((a, b) => a - b);
            this.logging.logPacket(packet, this.sequenceNumbers.length);
            this.logging.uploadPacket(packet);
        }
    }

    public getPacket(): RTPPacket | undefined {
        if (this.sequenceNumbers.length > 0 && !!this.packetsMap[this.sequenceNumbers[0]]) {
            const packet = this.packetsMap[this.sequenceNumbers[0]];
            delete this.packetsMap[this.sequenceNumbers[0]];
            this.sequenceNumbers.shift();
            return packet;
        }
    }

}
