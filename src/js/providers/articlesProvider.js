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
        this.searchKey = null;
        this.searchValue = null;
    }

    sortArticlesByDate(articles) {
        const filtredArticles = articles
            .filter(article => article.publishedAt !== null)
            .map((article) => {
                const { source: { name } } = article;
                let { publishedAt, author } = article;

                author = (author === null) ? name : author;
                publishedAt = new Date(publishedAt);

                return Object.assign(article, { publishedAt, author });
            })
            .sort((articleB, articleA) => (
                Number(articleA.publishedAt) - Number(articleB.publishedAt)
            ));

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

    searchArticles(searchKey, searchValue) {
        this.searchKey = searchKey;
        this.searchValue = searchValue;
        const requestValue = this.getRequestValue(searchKey, searchValue);

        return super.getData(requestValue)
            .then(({ articles, totalResults }) => {
            // (sd): maybe a good place for a strategy pattern?
                const sortedArticles = this.sortArticlesByDate(articles);
                this.articles.push(...sortedArticles);
                this.totalResults = totalResults - this.filtredArticlesCount;
                return this.articles;
            })
            .catch(() => {
                throw new Error('Something went wrong...</br> check internet connection');
            });
    }

    getNextMiddleArticles() {
        const {
            articles,
            numOfProvidedArticles,
            numArticlesOnPage,
        } = this;
        const endArrIndex = numArticlesOnPage + numOfProvidedArticles;

        return articles.slice(numArticlesOnPage, endArrIndex);
    }

    async getNextArticles() {
        // (sd): went a little mad with destructuring
        const {
            articles,
            numOfProvidedArticles,
            numArticlesOnPage,
            totalResults,
        } = this;
        const articlesAmount = articles.length;
        let nextArticles = [];

        if (totalResults <= this.numArticlesOnPage) {
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
                await this.searchArticles(this.searchKey, this.searchValue);
            }
            if (numArticlesOnPage === 0) {
                nextArticles = articles.slice(0, numOfProvidedArticles);
            } else if (totalResults >= numArticlesOnPage + numOfProvidedArticles) {
                nextArticles = this.getNextMiddleArticles();
            } else {
                nextArticles = articles.slice(numArticlesOnPage);
            }
        }

        this.numArticlesOnPage += nextArticles.length;

        return nextArticles;
    }
}
