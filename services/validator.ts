import axios from 'axios';
import {Constants} from '../configuration/contants';

/**
 * The service triggers the validation state machine
 * The validation verifies if all packets were added properly in order, and there are no drop packets.
 * If any discrepancies are detected, reacretion of the file is triggered.
 *
 * */
export class Validator {
    public validate(): void {
        axios.get(Constants.VALIDATOR_ENDPOINT).then((response) => {
            console.error('Logging::logAppend::response.data:', response.data);
        }).catch((error) => {
            console.error('Logging::response::error:', error);
        });
    }
}
