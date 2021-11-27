import axios from 'axios';

import {RTPPacket} from './rtp-packet';

export class Logging {

    public logAppend(packet: RTPPacket, packetsAmount = 0): void {
        axios.post('https://1lpczkcfg9.execute-api.us-east-1.amazonaws.com/dev/log-append', {
            sequenceNumber: packet.sequenceNumber,
            packetsAmount: packetsAmount,
            timestamp: Date.now()
        }).then((response) => {
            console.error('Logging::logAppend::response.data:', response.data);
        }).catch((error) => {
            console.error('Logging::response::error:', error);
        });
    }

    public logPacket(packet: RTPPacket, packetsAmount = 0): void {
        axios.post('https://1lpczkcfg9.execute-api.us-east-1.amazonaws.com/dev/log-packet', {
            sequenceNumber: packet.sequenceNumber,
            payload: packet.payload.toString('binary'),
            packetsAmount: packetsAmount,
            timestamp: Date.now()
        }).then((response) => {
            console.log('Logging::logPacket::response.data:', response.data);
        }).catch((error) => {
            console.error('Logging.logPacket.error:', error);
        });
    }

    public uploadPacket(packet: RTPPacket): void {
        try {
            axios.post('https://1lpczkcfg9.execute-api.us-east-1.amazonaws.com/dev/upload-packet', {
                fileName: packet.sequenceNumber,
                fileType: 'txt'
            }).then((response) => {
                console.error('Logging::uploadPacket::response.data:', response.data);
                axios.put(response.data, packet.payload.toString('binary'), {
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                }).then(result => {
                    console.log('Logging::uploadPacket::put::result:', result);
                }).catch(error => {
                    console.error('Logging::uploadPacket::put::error:', error);
                });
            }).catch((error) => {
                console.error('Logging::uploadPacket::put::error:', error);
            });
        } catch (error) {
            console.error('Logging::uploadPacket::put::try::error:', error);
        }
    }

    public recreateTable(): void {
        axios.post('https://1lpczkcfg9.execute-api.us-east-1.amazonaws.com/dev/recreate-table').then((response) => {
            console.log('Logging::recreateTable::post::response.data', response.data);
        }).catch((error) => {
            console.error('Logging::recreateTable::post::error', error);
        });
    }
}
