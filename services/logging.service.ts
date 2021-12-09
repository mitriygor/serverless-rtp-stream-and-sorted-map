import axios from 'axios';

/**
 * The service logs data to the cloud, AWS DynamoDB and AWS S3
 *
 * */
export class LoggingService<T extends { payload: Buffer, sequenceNumber: number }> {
    private logAppendEndpoint: string;
    private logPacketEndpoint: string;
    private uploadPacketEndpoint: string;
    private recreateTableEndpoint: string;

    constructor(logAppendEndpoint = '', logPacketEndpoint = '', uploadPacketEndpoint = '', recreateTableEndpoint = '') {
        this.logAppendEndpoint = logAppendEndpoint;
        this.logPacketEndpoint = logPacketEndpoint;
        this.uploadPacketEndpoint = uploadPacketEndpoint;
        this.recreateTableEndpoint = recreateTableEndpoint;
    }

    /**
     * The method logs packet sequence number and a timestamp.
     * Furthermore, it logs amount of packets in the list on each given moment.
     * It logs packets which were added to the output file
     *
     * @param packet
     * @param {number} packetsAmount
     */
    public logAppend(packet: T, packetsAmount = 0): void {
        axios.post(this.logAppendEndpoint, {
            sequenceNumber: packet.sequenceNumber,
            packetsAmount: packetsAmount,
            timestamp: Date.now()
        }).then((response) => {
            console.error('LoggingService::logAppend::response.data:', response.data);
        }).catch((error) => {
            console.error('LoggingService::response::error:', error);
        });
    }

    /**
     * The method logs received packet sequence number, payload and a timestamp.
     * It logs packets right after receiving from the transmitter
     *
     * @param packet
     * @param {number} packetsAmount
     */
    public logPacket(packet: T, packetsAmount = 0): void {
        axios.post(this.logPacketEndpoint, {
            sequenceNumber: packet.sequenceNumber,
            payload: packet.payload.toString('binary'),
            packetsAmount: packetsAmount,
            timestamp: Date.now()
        }).then((response) => {
            console.log('LoggingService::logPacket::response.data:', response.data);
        }).catch((error) => {
            console.error('LoggingService.logPacket.error:', error);
        });
    }

    /**
     * The method uploads received packet to AWS S3.
     * Firstly, the method calls an AWS Lambda function in order to receive a signed URL to upload packet to AWS S3
     * And after that, the method makes a request to an endpoint on the signed URL
     *
     * @param packet
     */
    public uploadPacket(packet: T): void {
        try {
            axios.post(this.uploadPacketEndpoint, {
                fileName: packet.sequenceNumber,
                fileType: 'txt'
            }).then((response) => {
                axios.put(response.data, packet.payload.toString('binary'), {
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                }).then(result => {
                    console.log('LoggingService::uploadPacket::put::result:', result);
                }).catch(error => {
                    console.error('LoggingService::uploadPacket::put::error:', error);
                });
            }).catch((error) => {
                console.error('LoggingService::uploadPacket::put::error:', error);
            });
        } catch (error) {
            console.error('LoggingService::uploadPacket::put::try::error:', error);
        }
    }

    /**
     * The method makes a requests to an endpoint which triggers a state machine which recreates AWS DynamoDB
     * It is done to developing purposes only in order to have empty tables on each run
     *
     */
    public recreateTable(): void {
        axios.post(this.recreateTableEndpoint).then((response) => {
            console.log('LoggingService::recreateTable::post::response.data', response.data);
        }).catch((error) => {
            console.error('LoggingService::recreateTable::post::error', error);
        });
    }
}
