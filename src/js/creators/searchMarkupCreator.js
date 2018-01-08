import SelectCreator from './selectCreator';
import SourcesProvider from './../providers/sourcesProvider';
import articlesSortTypes from './../constants/articlesSortTypes';

export default class SearchMarkupCreator {
    constructor() {
        this.container = document.querySelector('.inputs-container');
        this.selectCreator = new SelectCreator();
        this.sourcesProvider = new SourcesProvider();
    }

    createSmallSelects(secondSelect) {
        const selectsContainer = document.createElement('div');
        selectsContainer.className = 'selects__container';

        const languages = this.sourcesProvider.getLanguages();
        const languagesSelect = this.selectCreator.createSelect('language', languages);
        selectsContainer.appendChild(languagesSelect);

        const countries = this.sourcesProvider.getCountries();
        const countriesSelect = this.selectCreator.createSelect('country', countries);

        if (secondSelect) {
            selectsContainer.appendChild(secondSelect);
        } else {
            selectsContainer.appendChild(countriesSelect);
        }

        return selectsContainer;
    }

    renderQueryMarkup() {
        this.container.innerHTML = `
            <div class="search-type__container active">
                <input class="form__input" id="q" type="search" name="q" placeholder="Keywords"/>
            </div
        `;

        const sortBySelect = this.selectCreator.createSelect('sortBy', articlesSortTypes, true);
        const selectsContainer = this.createSmallSelects(sortBySelect);
        this.container.appendChild(selectsContainer);
    }

    renderCategoriesMarkup() {
        const categories = this.sourcesProvider.getCategories();
        const categoriesSelect = this.selectCreator.createSelect('category', categories);
        this.container.appendChild(categoriesSelect);
        this.container.appendChild(this.createSmallSelects());
    }

    renderQuerySources() {
        const sources = this.sourcesProvider.getSources()
            .reduce((acc, { id, name }) => {
                acc[id] = name;
                return acc;
            }, {});
        const sourcesSelect = this.selectCreator.createSelect('sources', sources);
        this.container.appendChild(sourcesSelect);
        this.container.appendChild(this.createSmallSelects());
    }

    renderMarkupByRadioValue(RadioValue) {
        this.container.innerHTML = '';
        switch (RadioValue) {
            case 'category': {
                return this.renderCategoriesMarkup();
            }
            case 'sources': {
                return this.renderQuerySources();
            }
            case 'q': {
                return this.renderQueryMarkup();
            }
            default: {
                return this.renderQueryMarkup();
            }
        }
    }
}
