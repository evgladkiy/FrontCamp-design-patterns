import RequestService from './../services/requestService';

import countries from './../constants/countries';
import languages from './../constants/languages';

let instance = null;

export default class SourcesProvider extends RequestService {
    constructor() {
        super();
        if (!instance) {
            instance = this;
        }

        this.sources = null;
        this.srcLanguages = {};
        this.srcCountries = {};
        this.srcCategories = {};

        return instance;
    }

    getSourcesFromApi() {
        return super.getData('sources?')
            .then(({ sources }) => {
                this.sources = sources;
                this.collectSourcesProps(sources);
            });
    }

    collectSourcesProps(sources) {
        sources.forEach((source) => {
            const { language: langCode, country: countryCode, category } = source;
            const { srcLanguages, srcCountries, srcCategories } = this;

            if (srcLanguages[langCode] === undefined
             && languages[langCode] !== undefined) {
                srcLanguages[langCode] = languages[langCode];
            }

            if (srcCountries[countryCode] === undefined
             && countries[countryCode] !== undefined) {
                srcCountries[countryCode] = countries[countryCode];
            }

            if (srcCategories[category] === undefined) {
                const categoryNameForSelect =
                    `${category[0].toUpperCase()}${category.slice(1)}`
                        .split('-').join(' ');

                srcCategories[category] = categoryNameForSelect;
            }
        });
    }

    getSources() {
        return this.sources;
    }

    getLanguages() {
        return this.srcLanguages;
    }

    getCountries() {
        return this.srcCountries;
    }

    getCategories() {
        return this.srcCategories;
    }

    init() {
        return this.getSourcesFromApi();
    }
}
