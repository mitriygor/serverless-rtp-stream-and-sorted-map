import axios from 'axios';

import {Constants} from '../configuration/contants';
import {RTPPacket} from '../models/rtp-packet';


/**
 * The service logs data to the cloud, AWS DynamoDB and AWS S3
 *
 * */
export class Logging {

    /**
     * The method logs packet sequence number and a timestamp.
     * Furthermore, it logs amount of packets in the list on each given moment.
     * It logs packets which were added to the output file
     *
     * @param {RTPPacket} packet
     * @param {number} packetsAmount
     */
    public logAppend(packet: RTPPacket, packetsAmount = 0): void {
        axios.post(Constants.LOG_APPEND_ENDPOINT, {
            sequenceNumber: packet.sequenceNumber,
            packetsAmount: packetsAmount,
            timestamp: Date.now()
        }).then((response) => {
            console.error('Logging::logAppend::response.data:', response.data);
        }).catch((error) => {
            console.error('Logging::response::error:', error);
        });
    }

    /**
     * The method logs received packet sequence number, payload and a timestamp.
     * It logs packets right after receiving from the transmitter
     *
     * @param {RTPPacket} packet
     * @param {number} packetsAmount
     */
    public logPacket(packet: RTPPacket, packetsAmount = 0): void {
        axios.post(Constants.LOG_PACKET_ENDPOINT, {
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

    /**
     * The method uploads received packet to AWS S3.
     * Firstly, the method calls an AWS Lambda function in order to receive a signed URL to upload packet to AWS S3
     * And after that, the method makes a request to an endpoint on the signed URL
     *
     * @param {RTPPacket} packet
     */
    public uploadPacket(packet: RTPPacket): void {
        try {
            axios.post(Constants.UPLOAD_PACKET_ENDPOINT, {
                fileName: packet.sequenceNumber,
                fileType: 'txt'
            }).then((response) => {
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

    /**
     * The method makes a requests to an endpoint which triggers a state machine which recreates AWS DynamoDB
     * It is done to developing purposes only in order to have empty tables on each run
     *
     */
    public recreateTable(): void {
        axios.post(Constants.RECREATE_TABLE_ENDPOINT).then((response) => {
            console.log('Logging::recreateTable::post::response.data', response.data);
        }).catch((error) => {
            console.error('Logging::recreateTable::post::error', error);
        });
    }
}
