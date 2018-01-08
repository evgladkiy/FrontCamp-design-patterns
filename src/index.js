import App from './js/app';
import './less/styles.less';

const newsApp = new App([
    'bbc-news',
    'independent',
    'the-washington-post',
    'the-new-york-times',
    'al-jazeera-english',
]);

newsApp.init();
