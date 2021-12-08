import SortedMapInterface from '../interfaces/sorted-map.interface';
import {RTPPacket} from './rtp-packet';

/**
 * Create a map of the packets and a list of their sequence numbers
 *
 * The class represents a priority-queue and sorted-map type model
 * The class returns only an element with the lowest sequence number,
 * as a priority-queue.
 *
 * At the same time, the data structure prevent duplications;
 * furthermore, the sequence numbers are sorted on each addition
 *
 * */
export class RtpMapModel implements SortedMapInterface<RTPPacket> {
    private sequenceNumbers: number[] = [];
    private packetsMap: { [index: number]: RTPPacket } = {};

    /**
     * Adds a packet to the map, and the packet's sequence number to the numbers' list.
     * On each addition, the list is sorted.
     * Prior of addition, there is verification if the packet is a duplicate
     *
     * @param {RTPPacket} packet
     *
     */
    public pushItem(packet: RTPPacket): void {
        if (!this.packetsMap[packet.sequenceNumber]) {
            this.packetsMap[packet.sequenceNumber] = packet;
            this.sequenceNumbers.push(packet.sequenceNumber);
            this.sequenceNumbers.sort((a, b) => a - b);
        }
    }

    /**
     * Removes and returns very first packet from the map
     *
     * @returns {RTPPacket | undefined} a packet based on the first sequence number in the numbers' list
     *
     */
    public shiftItem(): RTPPacket | undefined {
        if (this.sequenceNumbers.length > 0 && !!this.packetsMap[this.sequenceNumbers[0]]) {
            const packet = this.packetsMap[this.sequenceNumbers[0]];
            delete this.packetsMap[this.sequenceNumbers[0]];
            this.sequenceNumbers.shift();
            return packet;
        }
    }

    /**
     * Returns size of the based oon size of the sequence numbers list
     *
     * @returns {number}
     *
     */
    public getMapSize(): number {
        return this.sequenceNumbers.length;
    }
}
