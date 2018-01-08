export default class RequestService {
    constructor() {
        this.searchUrl = 'https://newsapi.org/v2/';
        this.apiKey = 'a7ce20d66ed9428483334b6a27210bbc';
    }

    async getData(requestValue) {
        const { searchUrl, apiKey } = this;
        const response = await fetch(`${searchUrl}${requestValue}apiKey=${apiKey}`);
        const json = await response.json();

        if (json.status === 'ok') {
            return json;
        }

        throw new Error('Something went wrong...</br> check internet connection');
    }
}
