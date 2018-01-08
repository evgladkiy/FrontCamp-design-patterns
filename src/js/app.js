import ArticlesCreator from './creators/articlesCreator';
import ErrorCreator from './creators/errorsCreator';
import ArticlesProvider from './providers/articlesProvider';
import SearchMarkupCreator from './creators/searchMarkupCreator';
import SourcesProvider from './providers/sourcesProvider';

import {throttle} from './services/helpers';

export default class App {
    constructor(defaultSources) {
        this.defaultSources = defaultSources;
        this.sourcesProvider = new SourcesProvider();
        this.sourcesProvider.sources = '2232';
        this.articlesCreator = new ArticlesCreator();
        this.errorCreator = new ErrorCreator();
        this.searchMarkupCreator = new SearchMarkupCreator();
        this.canGetNextArticles = true;
        this.isSubmitForsmHasArrors = false;
        this.articlesProvider = null;
        this.articlesContainer = document.querySelector('.articles-container');
        this.radioButtonsValue = document.querySelector('input:checked').value;
        this.goTopButton = document.querySelector('a.go-top');
        this.body = document.body;
    }

    searchSuitableArticles(searchKey, searchValue) {
        const { articlesProvider, articlesContainer, body } = this;

        // (sd): does this belong here?
        articlesContainer.innerHTML = '';
        body.className = 'with-spinner';

        return articlesProvider.searchArticles(searchKey, searchValue, (articles) => {

        })
            .then(() => articlesProvider.getNextArticles())
            .catch(err => err.message);
    }

    renderAtricles(articles) {
        const { articlesCreator, articlesContainer, body } = this;

        if (typeof articles === 'string') {
            throw new Error(articles);
        } else if (articles !== undefined) {
            // (sd): partial render responsibility?
            body.className = '';
            articlesCreator.renderArticles(articles, articlesContainer);
            return;
        }

        throw new Error('Nothing found...</br> check your request settings');
    }

    createNewArticles(searchKey, searchValue) {
        // (sd): all fields are usually initialized either in constructor or in init method
        // if it's a lazy init pattern, then it's suitable here
        this.articlesProvider = new ArticlesProvider();
        this.searchSuitableArticles(searchKey, searchValue)
            .then(articles => this.renderAtricles(articles))
            .catch(err => this.errorCreator.createError(err.message));
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
        const inputs = this.body.querySelectorAll('.form__input');
        const inputsArr = [...inputs];
        const searchValue = inputsArr.reduce((acc, { value, name }) => {
            return (value !== '')
                ? `${acc}${name}=${value}&`
                : acc;
        }, '');

        this.createSubmitErrors(inputsArr);

        if (!this.isSubmitForsmHasArrors) {
            // (sd): all fields are usually initialized either in constructor or in init method
            this.articlesProvider = new ArticlesProvider();
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

    async scrollHandler() {
        if (!this.canGetNextArticles) {
            return;
        }

        // (sd): went a little mad with destructuring
        const { body: { offsetHeight } } = this;
        const { documentElement: { scrollTop } } = document;

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

    onChangeRadioHandler(e) {
        const { target } = e;
        const { radioButtonsValue } = this;

        if (target.type === 'radio' && target.value !== radioButtonsValue) {
            this.radioButtonsValue = target.value;
            this.searchMarkupCreator.renderMarkupByRadioValue(this.radioButtonsValue);
        }
    }

    addAllListeners() {
        const delayedScrollHandler = throttle(this.scrollHandler, 300);
        const radiosContainer = document.querySelector('.radios-container');

        document.forms[0].addEventListener('submit', this.submitFormHandler.bind(this));
        document.addEventListener('scroll', delayedScrollHandler.bind(this));
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

        // (sd): return value?
        await this.sourcesProvider.init();
        await this.createNewArticles('sources', defaultSearchValue);

        this.searchMarkupCreator.renderMarkupByRadioValue('query');
        this.addAllListeners();
    }
}
