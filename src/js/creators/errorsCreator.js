export default class ErrorCreator {
    constructor() {
        this.errorContainer = document.querySelector('.articles-container');
    }

    createError(errorMessage) {
        document.body.className = '';
        this.errorContainer.innerHTML = `
            <p class="searchError centred">${errorMessage}</p>
        `;
    }
}
