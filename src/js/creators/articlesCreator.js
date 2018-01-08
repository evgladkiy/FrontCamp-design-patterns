export default class ArticlesCreator {
    getTemplate({
        url,
        urlToImage,
        description,
        source: { name },
        title,
        author,
        publishedAt,
    }) {
        const options = {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
        };

        return `
            <div class="article__img-container">
                <a class="article__img-wrapper" href="${url}">
                    <img class="article__img" src="${urlToImage}" />
                    <p class="article__description">${description}</p>
                </a>
                <span class="article__source">${name}</span>
            </div>
            <div class="article__content-container">
                <h3 class="article__title">
                    <a href="${url}">${title}</a>
                </h3>
                <p class="article__published">${author} - ${publishedAt.toLocaleString('en-US', options)}</p>
            </div>
        `;
    }

    renderArticles(articles, articlesContainer) {
        const container = document.createDocumentFragment();

        articles.forEach((article) => {
            const newArticle = document.createElement('article');

            newArticle.className = 'article';
            newArticle.innerHTML = this.getTemplate(article);
            container.appendChild(newArticle);
        });

        articlesContainer.appendChild(container);
    }
}
