import axios from 'axios';

export class Validation {
    public validate(): void {
        axios.get('https://1lpczkcfg9.execute-api.us-east-1.amazonaws.com/dev/validate').then((response) => {
            console.error('Logging::logAppend::response.data:', response.data);
        }).catch((error) => {
            console.error('Logging::response::error:', error);
        });
    }
}
