export abstract class Constants {
    static readonly OUTPUT_FILE: string = './data/output.ulaw';
    static readonly LOG_APPEND_ENDPOINT: string = 'https://1lpczkcfg9.execute-api.us-east-1.amazonaws.com/dev/log-append';
    static readonly LOG_PACKET_ENDPOINT: string = 'https://1lpczkcfg9.execute-api.us-east-1.amazonaws.com/dev/log-packet';
    static readonly UPLOAD_PACKET_ENDPOINT: string = 'https://1lpczkcfg9.execute-api.us-east-1.amazonaws.com/dev/upload-packet';
    static readonly RECREATE_TABLE_ENDPOINT: string = 'https://1lpczkcfg9.execute-api.us-east-1.amazonaws.com/dev/recreate-table';
    static readonly VALIDATOR_ENDPOINT: string = 'https://1lpczkcfg9.execute-api.us-east-1.amazonaws.com/dev/validate';
    static readonly RECEIVER_PORT: number = 3456;
    static readonly  NO_MORE_PACKETS_TIMEOUT_MILLIS: number = 100;
    static readonly  INITIAL_BUFFER_SIZE: number = 10;
    static readonly  MIN_BUFFER_SIZE: number = 0;
}
