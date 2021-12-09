import {RtpMapModel} from '../../models/rtp-map.model';
import {RTPPacket} from '../../models/rtp-packet';

describe('test the RTP Map based on SortedMap', () => {
    const MAX_PACKETS_NUMBER = 5;
    const SEQUENCE_NUMBERS = [3, 1, 2, 5, 4];
    const MIN_SEQUENCE_NUMBER = 1;

    let rtpMap: RtpMapModel;
    let rtpItem: RTPPacket | undefined;

    beforeEach(() => {
        rtpMap = new RtpMapModel();

        for (let i = 0; i < MAX_PACKETS_NUMBER; i++) {
            const packet = new RTPPacket();
            packet.sequenceNumber = SEQUENCE_NUMBERS[i];
            rtpMap.pushItem(packet);
        }
    });

    test('verify first sequence number', () => {
        rtpItem = rtpMap.shiftItem();
        expect(rtpItem).toBeDefined();

        if (rtpItem) {
            expect(rtpItem.sequenceNumber).toBe(MIN_SEQUENCE_NUMBER);
        }
    });

    test('verify size of the map', () => {
        expect(rtpMap.getMapSize()).toBe(MAX_PACKETS_NUMBER);
    });
});
