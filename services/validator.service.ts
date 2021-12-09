import axios from 'axios';

/**
 * The service triggers the validation state machine
 * The validation verifies if all packets were added properly in order, and there are no drop packets.
 * If any discrepancies are detected, reacretion of the file is triggered.
 *
 * */
export class ValidatorService {
    private url: string;

    constructor(url = '') {
        this.url = url;
    }

    public validate(): void {
        axios.get(this.url).then((response) => {
            console.error('LoggingService::logAppend::response.data:', response.data);
        }).catch((error) => {
            console.error('LoggingService::response::error:', error);
        });
    }
}
