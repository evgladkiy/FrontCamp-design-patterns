import RequestService from './../services/requestService';

import countries from './../constants/countries';
import languages from './../constants/languages';

class SourcesProvider extends RequestService {
    constructor() {
        super();
        if (!SourcesProvider.instance) {
            this._sources = null;
            this._srcLanguages = {};
            this._srcCountries = {};
            this._srcCategories = {};
            SourcesProvider.instance = this;
        }

        return SourcesProvider.instance;
    }

    getArticleSources() {
        return super.getData('sources?')
            .then(({ sources }) => {
                this._sources = sources;
                this.collectSourcesProps(sources);
            });
    }

    collectSourcesProps(sources) {
        sources.forEach((source) => {
            const { language: langCode, country: countryCode, category } = source;
            const { _srcLanguages, _srcCountries, _srcCategories } = this;

            if (_srcLanguages[langCode] === undefined
             && languages[langCode] !== undefined) {
                _srcLanguages[langCode] = languages[langCode];
            }

            if (_srcCountries[countryCode] === undefined
             && countries[countryCode] !== undefined) {
                _srcCountries[countryCode] = countries[countryCode];
            }

            if (_srcCategories[category] === undefined) {
                const categoryNameForSelect =
                    `${category[0].toUpperCase()}${category.slice(1)}`
                        .split('-').join(' ');

                _srcCategories[category] = categoryNameForSelect;
            }
        });
    }

    getSources() {
        return this._sources;
    }

    getLanguages() {
        return this._srcLanguages;
    }

    getCountries() {
        return this._srcCountries;
    }

    getCategories() {
        return this._srcCategories;
    }
}

const sourcesProvider = new SourcesProvider();

export default sourcesProvider;
