import {RTPPacket} from './rtp-packet';

/**
 * The class represents a priority-queue and sorted-map type model
 * The class returns only an element with the lowest sequence number,
 * as a priority-queue.
 *
 * At the same time, the data structure prevent duplications;
 * furthermore, the sequence numbers are sorted on each addition
 *
 * */
export class RTPList {
    public sequenceNumbers: number[];
    public packetsMap: { [index: number]: RTPPacket };

    /**
     * Create a map of the packets and a list of their sequence numbers
     * @param {number[]} sequenceNumbers
     * @param {[index: number]: RTPPacket} packetsMap
     */
    constructor(sequenceNumbers: number[] = [], packetsMap: { [index: number]: RTPPacket } = {}) {
        this.sequenceNumbers = sequenceNumbers;
        this.packetsMap = packetsMap;
    }

    /**
     * Adds a packet to the map, and the packet's sequence number to the numbers' list.
     * On each addition, the list is sorted.
     * Prior of addition, there is verification if the packet is a duplicate
     *
     * @param {RTPPacket} packet
     *
     */
    public addPacket(packet: RTPPacket): void {
        if (!this.packetsMap[packet.sequenceNumber]) {
            this.packetsMap[packet.sequenceNumber] = packet;
            this.sequenceNumbers.push(packet.sequenceNumber);
            this.sequenceNumbers.sort((a, b) => a - b);
        }
    }

    /**
     * Remove and return very first packet from the map
     *
     * @returns {RTPPacket | undefined} a packet based on the first sequence number in the numbers' list
     *
     */
    public getPacket(): RTPPacket | undefined {
        if (this.sequenceNumbers.length > 0 && !!this.packetsMap[this.sequenceNumbers[0]]) {
            const packet = this.packetsMap[this.sequenceNumbers[0]];
            delete this.packetsMap[this.sequenceNumbers[0]];
            this.sequenceNumbers.shift();
            return packet;
        }
    }
}
