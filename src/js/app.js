import ArticlesCreator from './creators/articlesCreator';
import ErrorCreator from './creators/errorsCreator';
import ArticlesProvider from './providers/articlesProvider';
import SearchMarkupCreator from './creators/searchMarkupCreator';
import sourcesProvider from './providers/sourcesProvider';

import throttle from './decorators/throttle';

export default class App {
    constructor(defaultSources) {
        this.defaultSources = defaultSources;
        this.sourcesProvider = sourcesProvider;
        this.articlesProvider = new ArticlesProvider();
        this.articlesCreator = new ArticlesCreator();
        this.errorCreator = new ErrorCreator();
        this.searchMarkupCreator = new SearchMarkupCreator();
        this.canGetNextArticles = true;
        this.isSubmitForsmHasArrors = false;
        this.articlesContainer = document.querySelector('.articles-container');
        this.radioButtonsValue = document.querySelector('input:checked').value;
        this.goTopButton = document.querySelector('a.go-top');
        this.body = document.body;
    }

    searchSuitableArticles(searchKey, searchValue) {
        const { articlesProvider, articlesContainer, body } = this;

        return articlesProvider.searchArticlesBy(searchKey, searchValue, (articles) => {
            return articles.sort((articleB, articleA) => (
                Number(articleA.publishedAt) - Number(articleB.publishedAt)
            ))
        })
            .then(() => articlesProvider.getNextArticles())
            .catch(err => err.message);
    }

    renderAtricles(articles) {
        const { articlesCreator, articlesContainer, body } = this;

        if (typeof articles === 'string') {
            throw new Error(articles);
        } else if (!Array.isArray(articles)) {
            throw new Error('Nothing found...</br> check your request settings');
        }

        articlesCreator.renderArticles(articles, articlesContainer);
    }

    createNewArticles(searchKey, searchValue) {
        this.searchSuitableArticles(searchKey, searchValue)
            .then(articles => this.renderAtricles(articles))
            .then(() => this.toggleSpiner())
            .catch(err => this.errorCreator.createError(err.message));
    }

    toggleSpiner() {
        const { body } = this;

        body.className = (body.className === '') ? 'with-spinner' : ''
    }

    createSubmitErrors(inputs) {
        const { radioButtonsValue } = this;
        const { forms } = document;
        const mainSerchInputValue = forms[0][this.radioButtonsValue].value.trim();
        let errorMessage = null;

        this.isSubmitForsmHasArrors = false;

        if (radioButtonsValue === 'q' && mainSerchInputValue === '') {
            errorMessage = 'Keywords is required </br>for search articles...';
        } else if (inputs.every(({ value }) => value === '')) {
            errorMessage = 'You must select</br>at least one option</br> not by default';
        }

        if (errorMessage !== null) {
            this.errorCreator.createError(errorMessage);
            this.isSubmitForsmHasArrors = true;
        }
    }

    submitFormHandler(e) {
        this.articlesContainer.innerHTML = ''
        const inputs = this.body.querySelectorAll('.form__input');
        const inputsArr = [...inputs];
        const searchValue = inputsArr.reduce((acc, { value, name }) => {
            return (value !== '')
                ? `${acc}${name}=${value}&`
                : acc;
        }, '');

        this.createSubmitErrors(inputsArr);

        if (!this.isSubmitForsmHasArrors) {
            this.articlesProvider.reset();
            this.toggleSpiner();
            this.createNewArticles(this.radioButtonsValue, searchValue);
        }

        e.preventDefault();
    }

    changeGoTopButtonVisibility(scrollTop) {
        const { goTopButton } = this;

        if (scrollTop >= 500 && goTopButton.className.indexOf('visible') < 0) {
            goTopButton.className += ' visible';
        } else if (scrollTop < 500 && goTopButton.className.indexOf('visible') >= 0) {
            goTopButton.className = 'go-top';
        }
    }

    @throttle(300)
    async scrollHandler() {
        console.log('scroll'); // for testing decorator work
        if (this.canGetNextArticles) {
            const { offsetHeight } = this.body;
            const { scrollTop } = document.documentElement;

            this.changeGoTopButtonVisibility(scrollTop);

            if ((offsetHeight <= (offsetHeight * 0.25) + scrollTop)) {
                this.canGetNextArticles = false;
                const nextArticles = await this.articlesProvider.getNextArticles();

                if (nextArticles !== undefined) {
                    this.renderAtricles(nextArticles);
                }

                this.canGetNextArticles = true;
            }
        }
    }

    onChangeRadioHandler(e) {
        const { target } = e;
        const { radioButtonsValue } = this;

        if (target.type === 'radio' && target.value !== radioButtonsValue) {
            this.radioButtonsValue = target.value;
            this.searchMarkupCreator.renderMarkupByRadioValue(this.radioButtonsValue);
        }
    }

    addAllListeners() {
        const radiosContainer = document.querySelector('.radios-container');

        document.forms[0].addEventListener('submit', this.submitFormHandler.bind(this));
        document.addEventListener('scroll', this.scrollHandler.bind(this));
        radiosContainer.addEventListener('click', this.onChangeRadioHandler.bind(this));

        this.goTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        });
    }

    async init() {
        const defaultSearchValue = `sources=${this.defaultSources.toString()}&`;

        await this.sourcesProvider.getArticleSources();
        await this.createNewArticles('sources', defaultSearchValue);

        this.searchMarkupCreator.renderMarkupByRadioValue('query');
        this.addAllListeners();
    }
}
