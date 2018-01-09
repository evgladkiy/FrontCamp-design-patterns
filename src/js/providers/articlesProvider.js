import RequestService from './../services/requestService';

export default class ArticlesProvider extends RequestService {
    constructor() {
        super();
        this.articles = [];
        this.numOfProvidedArticles = 10;
        this.nextSearhPage = 1;
        this.numArticlesOnPage = 0;
        this.totalResults = 0;
        this.filtredArticlesCount = 0;
        this.searchParams = null;
    }

    reset() {
        this.articles = [];
        this.nextSearhPage = 1;
        this.numArticlesOnPage = 0;
        this.totalResults = 0;
        this.filtredArticlesCount = 0;
    }

    filterArtiles(articles) {
        const filtredArticles = articles
            .filter(article => article.publishedAt !== null)
            .map((article) => {
                const { source: { name } } = article;
                let { publishedAt, author } = article;

                author = (author === null) ? name : author;
                publishedAt = new Date(publishedAt);

                return Object.assign(article, { publishedAt, author });
            });

        this.filtredArticlesCount += (articles.length - filtredArticles.length);

        return filtredArticles;
    }

    getRequestValue(searchKey, searchValue) {
        switch (searchKey) {
            case 'category':
            case 'sources': {
                return `top-headlines?${searchValue}`;
            }
            case 'q': {
                return `everything?${searchValue}page=${this.nextSearhPage++}&`;
            }
            default: {
                return new Error('invalid searhKey or searchValue');
            }
        }
    }

    searchArticlesBy(searchKey, searchValue, sortFunc) {
        const requestValue = this.getRequestValue(searchKey, searchValue);

        if (this.searchParams === null) {
            this.searchParams = [...arguments];
        }

        return super.getData(requestValue)
            .then(({ articles, totalResults }) => {
                const sortedArticles = sortFunc(this.filterArtiles(articles));

                this.articles.push(...sortedArticles);
                this.totalResults = totalResults - this.filtredArticlesCount;

                return this.articles;
            })
            .catch(() => {
                throw new Error('Something went wrong...</br> check internet connection');
            });
    }

    getNextMiddleArticles() {
        const { numOfProvidedArticles, numArticlesOnPage } = this;
        const endArrIndex = numArticlesOnPage + numOfProvidedArticles;

        return this.articles.slice(numArticlesOnPage, endArrIndex);
    }

    async getNextArticles() {
        const { articles, numOfProvidedArticles, numArticlesOnPage } = this;
        const articlesAmount = articles.length;
        let nextArticles = [];

        if (this.totalResults <= this.numArticlesOnPage) {
            return;
        }

        if (this.nextSearhPage === 1) {
            if (articlesAmount <= numOfProvidedArticles) {
                nextArticles = articles;
            } else if (articlesAmount >= numArticlesOnPage + numOfProvidedArticles) {
                nextArticles = this.getNextMiddleArticles();
            } else {
                nextArticles = articles.slice(numArticlesOnPage);
            }
        } else {
            if (articlesAmount < numArticlesOnPage + numOfProvidedArticles) {
                await this.searchArticlesBy(...this.searchParams);
            }
            if (numArticlesOnPage === 0) {
                nextArticles = articles.slice(0, numOfProvidedArticles);
            } else if (this.totalResults >= numArticlesOnPage + numOfProvidedArticles) {
                nextArticles = this.getNextMiddleArticles();
            } else {
                nextArticles = articles.slice(numArticlesOnPage);
            }
        }

        this.numArticlesOnPage += nextArticles.length;

        return nextArticles;
    }
}
